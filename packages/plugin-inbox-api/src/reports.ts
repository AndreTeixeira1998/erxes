import { IUserDocument } from '@erxes/api-utils/src/types';
import { models } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';

const MMSTOMINS = 60000;

const MMSTOHRS = MMSTOMINS * 60;

const reportTemplates = [
  {
    serviceType: 'inbox',
    title: 'Inbox chart',
    serviceName: 'inbox',
    description: 'Chat conversation charts',
    charts: [
      'averageFirstResponseTime',
      'averageCloseTime',
      'closedConversationsCount'
    ],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png'
  }
];

const integrationTypes = async () => {
  const integrationTypes = Array.from(
    new Set((await models?.Integrations.find())?.map(i => i.kind))
  );

  return integrationTypes;
};

// XOS messenger
// email
// Call
// CallPro
// FB post
// FB messenger
// SMS
// All

// All time
// Today
// Yesterday
// Last week/month/year
// This week/month/year
// Rolling date range
// Custom date range

const DATERANGE_TYPES = [
  { label: 'All time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'today' },
  { label: 'Last Week', value: 'lastweek' },
  { label: 'This Week', value: 'thisweek' }
];

const INTEGRATION_TYPES = [
  { label: 'XOS Messenger', value: 'messenger' },
  { label: 'Email', value: 'email' },
  { label: 'Call', value: 'calls' },
  { label: 'Callpro', value: 'callpro' },
  { label: 'SMS', value: 'sms' },
  { label: 'Facebook Messenger', value: 'facebook-messenger' },
  { label: 'Facebook Post', value: 'facebook-post' },
  { label: 'All', value: 'all' }
];

const calculateAverage = (arr: number[]) => {
  if (!arr || !arr.length) {
    return 0; // Handle division by zero for an empty array
  }

  const sum = arr.reduce((acc, curr) => acc + curr, 0);
  return (sum / arr.length).toFixed();
};

const chartTemplates = [
  {
    templateType: 'averageFirstResponseTime',
    name: 'Average first response time by rep in hours',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, subdomain: string) => {
      const matchfilter = {
        'conversationMessages.internal': false,
        'conversationMessages.content': { $ne: '' }
      };

      // filter by source
      if (filter.integrationType && filter.integrationType !== 'all') {
        const { integrationType } = filter;

        const integrations: any = await models?.Integrations.find({
          kind: integrationType
        });

        const integrationIds = integrations.map(i => i._id);

        matchfilter['integrationId'] = { $in: integrationIds };
      }

      matchfilter['conversationMessages.userId'] =
        filter && filter.userIds
          ? {
              $exists: true,
              $in: filter.userIds
            }
          : { $exists: true };

      const conversations = await models?.Conversations.aggregate([
        {
          $lookup: {
            from: 'conversation_messages',
            let: { id: '$_id', customerFirstMessagedAt: '$createdAt' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$conversationId', '$$id'] }
                }
              }
            ],
            as: 'conversationMessages'
          }
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            conversationMessages: 1,
            integrationId: 1,
            closedAt: 1,
            closedUserId: 1,
            firstRespondedDate: 1,
            firstRespondedUserId: 1
          }
        },
        {
          $match: {
            conversationMessages: { $not: { $size: 0 } } // Filter out documents with empty 'conversationMessages' array
          }
        },
        {
          $unwind: '$conversationMessages'
        },
        {
          $sort: {
            'conversationMessages.createdAt': 1
          }
        },
        {
          $match: matchfilter
        },
        {
          $group: {
            _id: '$_id',
            conversationMessages: { $push: '$conversationMessages' },
            customerMessagedAt: { $first: '$createdAt' },
            integrationId: { $first: '$integrationId' },
            closedAt: { $first: '$closedAt' },
            closedUserId: { $first: '$closedUserId' },
            firstRespondedDate: { $first: '$firstRespondedDate' },
            firstResponedUserId: { $first: '$firstResponedUserId' }
          }
        }
      ]);

      type UserWithFirstRespondTime = {
        [userId: string]: number[];
      };

      const usersWithRespondTime: UserWithFirstRespondTime = {};

      console.log(matchfilter, ' filter');

      if (conversations) {
        console.log(conversations?.length, ' length');

        for (const convo of conversations) {
          const {
            conversationMessages,
            firstRespondedDate,
            firstResponedUserId,
            customerMessagedAt
          } = convo;

          if (firstRespondedDate && firstResponedUserId) {
            const respondTime =
              (new Date(firstRespondedDate).getTime() -
                new Date(customerMessagedAt).getTime()) /
              MMSTOHRS;

            if (firstResponedUserId in usersWithRespondTime) {
              usersWithRespondTime[firstResponedUserId] = [
                ...usersWithRespondTime[firstResponedUserId],
                respondTime
              ];
            } else {
              usersWithRespondTime[firstResponedUserId] = [respondTime];
            }

            continue;
          }

          if (conversationMessages.length) {
            const getFirstRespond = conversationMessages[0];
            const { userId } = getFirstRespond;

            const respondTime =
              (new Date(getFirstRespond.createdAt).getTime() -
                new Date(customerMessagedAt).getTime()) /
              MMSTOHRS;

            if (userId in usersWithRespondTime) {
              usersWithRespondTime[userId] = [
                ...usersWithRespondTime[userId],
                respondTime
              ];
            } else {
              usersWithRespondTime[userId] = [respondTime];
            }
          }
        }
      }

      const getTotalRespondedUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: Object.keys(usersWithRespondTime) } }
        },
        isRPC: true,
        defaultValue: []
      });

      const usersMap = {};

      for (const user of getTotalRespondedUsers) {
        usersMap[user._id] = {
          fullName:
            user.details?.fullName ||
            `${user.details?.firstName || ''} ${user.details?.lastName || ''}`,
          avgRespondtime: calculateAverage(usersWithRespondTime[user._id])
        };
      }

      const data = Object.values(usersMap).map((t: any) => t.avgRespondtime);

      const labels = Object.values(usersMap).map((t: any) => t.fullName);

      const title = 'Average first response time in hours';

      const datasets = { title, data, labels };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'userIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select users'
      },
      {
        fieldName: 'integrationType',
        fieldType: 'select',
        multi: true,
        fieldOptions: INTEGRATION_TYPES,
        fieldLabel: 'Select source'
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: 'Select date range'
      }
    ]
  },

  {
    templateType: 'averageCloseTime',
    name: 'Average chat close time by rep in hours',
    chartTypes: ['bar', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, subdomain: string) => {
      const matchfilter = {
        status: /closed/gi,
        closedAt: { $exists: true }
      };

      // filter by source
      if (filter.integrationType && filter.integrationType !== 'all') {
        const [integrationType] = filter;

        const integration: any = await models?.Integrations.find({
          kind: integrationType
        });

        matchfilter['conversationMessages.integrationId'] = integration._id;
      }

      matchfilter['closedUserId'] =
        filter && filter.userIds
          ? {
              $exists: true,
              $in: filter.userIds
            }
          : { $exists: true };

      const usersWithClosedTime = await models?.Conversations.aggregate([
        {
          $match: matchfilter
        },

        {
          $project: {
            closeTimeDifference: { $subtract: ['$closedAt', '$createdAt'] },
            closedUserId: '$closedUserId'
          }
        },
        {
          $group: {
            _id: '$closedUserId',
            avgCloseTimeDifference: { $avg: '$closeTimeDifference' }
          }
        }
      ]);

      const usersWithClosedTimeMap = {};
      const getUserIds: string[] = [];

      if (usersWithClosedTime) {
        for (const user of usersWithClosedTime) {
          getUserIds.push(user._id);
          usersWithClosedTimeMap[user._id] = (
            user.avgCloseTimeDifference / MMSTOHRS
          ).toFixed();
        }
      }

      const getTotalClosedUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: getUserIds } }
        },
        isRPC: true,
        defaultValue: []
      });

      const usersMap = {};

      for (const user of getTotalClosedUsers) {
        usersMap[user._id] = {
          fullName:
            user.details?.fullName ||
            `${user.details?.firstName || ''} ${user.details?.lastName || ''}`,
          avgCloseTime: usersWithClosedTimeMap[user._id]
        };
      }

      const data = Object.values(usersMap).map((t: any) => t.avgCloseTime);

      const labels = Object.values(usersMap).map((t: any) => t.fullName);

      const title = 'Average conversation close time in hours';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'userIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select users'
      },
      {
        fieldName: 'integrationType',
        fieldType: 'select',
        multi: true,
        fieldOptions: INTEGRATION_TYPES,
        fieldLabel: 'Select source'
      }
    ]
  },
  {
    templateType: 'closedConversationsCount',
    name: 'Closed conversations count by rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, subdomain: string) => {
      const matchfilter = {
        status: /closed/gi,
        closedAt: { $exists: true }
      };

      // filter by source
      if (filter.integrationType && filter.integrationType !== 'all') {
        const [integrationType] = filter;

        const integration: any = await models?.Integrations.find({
          kind: integrationType
        });

        matchfilter['conversationMessages.integrationId'] = integration._id;
      }

      matchfilter['closedUserId'] =
        filter && filter.userIds
          ? {
              $exists: true,
              $in: filter.userIds
            }
          : { $exists: true };

      const usersWithClosedConvosCount = await models?.Conversations.aggregate([
        {
          $match: matchfilter
        },
        {
          $group: {
            _id: '$closedUserId',
            closedConversationsCount: { $sum: 1 }
          }
        }
      ]);

      const usersWithClosedCount = {};

      const getUserIds: string[] =
        usersWithClosedConvosCount?.map(r => r._id) || [];

      const getTotalClosedUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: getUserIds } }
        },
        isRPC: true,
        defaultValue: []
      });

      const usersMap = {};

      for (const user of getTotalClosedUsers) {
        usersMap[user._id] = {
          fullName:
            user.details?.fullName ||
            `${user.details?.firstName || ''} ${user.details?.lastName || ''}`
        };
      }

      const data: number[] = [];
      const labels: string[] = [];

      if (usersWithClosedConvosCount) {
        for (const user of usersWithClosedConvosCount) {
          data.push(user.closedConversationsCount);
          labels.push(usersMap[user._id].fullName);
        }
      }

      const title = `Closed conversations' count`;

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'userIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select users'
      },
      {
        fieldName: 'integrationType',
        fieldType: 'select',
        multi: true,
        fieldOptions: INTEGRATION_TYPES,
        fieldLabel: 'Select source'
      }
    ]
  }
];

const getChartResult = async ({ subdomain, data }) => {
  const { templateType, filter, currentUser } = data;

  const template =
    chartTemplates.find(t => t.templateType === templateType) || ({} as any);

  return template.getChartResult(filter, subdomain, currentUser);
};

export default {
  chartTemplates,
  reportTemplates,
  getChartResult
};

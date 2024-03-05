import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';
import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { NOTIFICATION_MODULES } from './constants';

export default {
  name: 'chats',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'graphql',
    'subscriptionPlugin.js',
  ),

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {
  },
  setupMessageConsumers,
  meta: {
    notificationModules: NOTIFICATION_MODULES,
    permissions,
  },
};

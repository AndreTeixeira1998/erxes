import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { IContext } from '../../connectionResolver';
import { sendProductsMessage } from '../../messageBroker';
import {
  IField,
  IFieldDocument,
  IFieldGroupDocument
} from '../../models/definitions/fields';

export const field = {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Fields.findOne({ _id });
  },
  async name(root: IFieldDocument) {
    return `erxes-form-field-${root._id}`;
  },

  async lastUpdatedUser(root: IFieldDocument) {
    const { lastUpdatedUserId } = root;

    if (!lastUpdatedUserId) {
      return;
    }

    return {
      __typename: 'User',
      _id: lastUpdatedUserId
    };
  },

  async associatedField(root: IFieldDocument, _params, { models }: IContext) {
    const { associatedFieldId } = root;

    // Returning field that associated with form field
    return models.Fields.findOne({ _id: associatedFieldId });
  },

  async subFields(root: IFieldDocument, _params, { models }: IContext) {
    const { subFieldIds = [] } = root;
    const subfields = await models.Fields.find({ _id: { $in: subFieldIds } });

    return subfields.sort(
      (a, b) => subFieldIds.indexOf(a._id) - subFieldIds.indexOf(b._id)
    );
  },

  async groupName(root: IFieldDocument, _params, { models }: IContext) {
    const { groupId } = root;

    const group = await models.FieldsGroups.findOne({ _id: groupId });
    return group && group.name;
  },

  async products(root: IFieldDocument, _args, { subdomain }: IContext) {
    const { productCategoryId } = root;

    if (!productCategoryId) {
      return;
    }

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: {
          categoryId: productCategoryId
        }
      },
      isRPC: true,
      defaultValue: []
    });

    return products.map(product => ({
      _id: product._id,
      name: product.name,
      unitPrice: product.unitPrice
    }));
  }
};

export const fieldsGroup = {
  async fields(root: IFieldGroupDocument, _params, { models }: IContext) {
    // Returning all fields that are related to the group
    const fields = await models.Fields.find({
      groupId: root._id,
      contentType: root.contentType
    }).sort({ order: 1 });

    // Splitting code to array
    const splitted = root.code && root.code.split(':');

    if (splitted && splitted.length === 3 && splitted[2] === 'relations') {
      const enabledFields: IField[] = [];
      for (const f of fields) {
        if (await isEnabled(f.relationType?.split(':')[0])) {
          enabledFields.push(f);
        }
      }

      return enabledFields;
    }

    return fields;
  },

  async lastUpdatedUser(fieldGroup: IFieldGroupDocument) {
    const { lastUpdatedUserId } = fieldGroup;

    if (!lastUpdatedUserId) {
      return;
    }

    return {
      __typename: 'User',
      _id: lastUpdatedUserId
    };
  }
};

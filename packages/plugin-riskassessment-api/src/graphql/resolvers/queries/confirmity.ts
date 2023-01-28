import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IRiskConformityParams } from '../../../models/definitions/common';

const RiskConformityQuries = {
  async riskConformity(
    _root,
    params: IRiskConformityParams,
    { models }: IContext
  ) {
    return await models.RiskConformity.riskConformity(params);
  },
  async riskConformities(
    _root,
    params: IRiskConformityParams,
    { models }: IContext
  ) {
    return await models.RiskConformity.riskConformities(params);
  },
  async riskConformitiesTotalCount(
    _root,
    params: IRiskConformityParams,
    { models }: IContext
  ) {
    return await models.RiskConformity.riskConformitiesTotalCount(params);
  },
  async riskConformityDetail(
    _root,
    params: IRiskConformityParams,
    { models }: IContext
  ) {
    const resu = await models.RiskConformity.riskConformityDetail(params);
    return resu;
  },
  async riskConformitySubmissions(
    _root,
    params: { cardId: string },
    { models }: IContext
  ) {
    return await models.RiskConformity.riskConformitySubmissions(params);
  },

  async riskConformityFormDetail(_root, params, { models }: IContext) {
    return await models.RiskConformity.riskConformityFormDetail(params);
  }
};

// checkPermission(RiskConformityQuries, 'riskConformity', 'showRiskAssessment');
// checkPermission(
//   RiskConformityQuries,
//   'riskConformityDetails',
//   'showRiskAssessment'
// );
// checkPermission(
//   RiskConformityQuries,
//   'riskConformitySubmissions',
//   'showRiskAssessment'
// );
// checkPermission(
//   RiskConformityQuries,
//   'riskConformityFormDetail',
//   'showRiskAssessment'
// );

export default RiskConformityQuries;

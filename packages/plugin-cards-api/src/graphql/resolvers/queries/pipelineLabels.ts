import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const pipelineLabelQueries = {
  /**
   *  Pipeline label list
   */
  async pipelineLabels(
    _root,
    { pipelineId }: { pipelineId: string },
    { models: { PipelineLabels } }: IContext
  ) {
    return PipelineLabels.find({ pipelineId });
  },

  /**
   *  Pipeline label detail
   */
  async pipelineLabelDetail(
    _root,
    { _id }: { _id: string },
    { models: { PipelineLabels } }: IContext
  ) {
    return PipelineLabels.findOne({ _id });
  }
};

moduleRequireLogin(pipelineLabelQueries);

export default pipelineLabelQueries;

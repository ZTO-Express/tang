import {
  GenericConfigObject,
  TangDocumentGeneration,
  TangDocumentOutput,
  TangDocumentOutputer,
} from '../common/types';

/**
 * 内存文件输出器，一般用于测试或watch的场景
 */
export const memoryOutputer = (): TangDocumentOutputer => {
  return {
    type: 'outputer',

    name: 'memory',

    async output(
      generation: TangDocumentGeneration,
      options?: GenericConfigObject,
    ): Promise<TangDocumentOutput> {
      return undefined;
    },
  };
};

import {
  GenericConfigObject,
  TangChunk,
  TangDocument,
  TangGeneration,
  TangGenerator,
} from '../common/types';

/**
 * json文件生成器
 */
export const jsonGenerator = (): TangGenerator => {
  return {
    type: 'generator',

    name: 'json',

    async generate(
      document: TangDocument,
      options: GenericConfigObject,
    ): Promise<TangGeneration> {
      const opts = Object.assign(
        { name: 'default.json', space: 2, replacer: null },
        options,
      );

      const content = JSON.stringify(document.model, opts.replacer, opts.space);

      const chunks: TangChunk[] = [{ name: opts.name, content }];

      return {
        chunks,
      };
    },
  };
};

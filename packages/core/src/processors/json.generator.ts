import {
  GenericConfigObject,
  Chunk,
  Document,
  TangGenerateResult,
  TangGenerator,
} from '@tang/common';

/**
 * json文件生成器
 */
export const jsonGenerator = (): TangGenerator => {
  return {
    type: 'generator',

    name: 'json',

    async generate(
      document: Document,
      options: GenericConfigObject,
    ): Promise<TangGenerateResult> {
      const opts = Object.assign(
        { name: 'default.json', space: 2, replacer: null },
        options,
      );

      const content = JSON.stringify(document.model, opts.replacer, opts.space);

      const chunks: Chunk[] = [{ name: opts.name, content }];

      return {
        chunks,
      };
    },
  };
};

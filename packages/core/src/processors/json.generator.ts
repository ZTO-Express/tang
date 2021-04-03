import {
  GenericConfigObject,
  Chunk,
  Document,
  TangGenerateResult,
  TangGenerator,
} from '@devs-tang/common';
import { normalizeCoreProcessor } from './util';

/**
 * json文件生成器
 */
export const jsonGenerator = (): TangGenerator => {
  return normalizeCoreProcessor({
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
  });
};

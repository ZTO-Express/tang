import {
  GenericConfigObject,
  Chunk,
  TangDocument,
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
      document: TangDocument,
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

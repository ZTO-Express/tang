import {
  GenericConfigObject,
  Chunk,
  TangDocument,
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

    async generate(document: TangDocument, options: GenericConfigObject) {
      const opts = Object.assign(
        { name: 'default.json', space: 2, replacer: null },
        options,
      );

      const content = JSON.stringify(document.model, opts.replacer, opts.space);

      document.chunks = [{ name: opts.name, content }];
      document.chunks;

      return document;
    },
  });
};

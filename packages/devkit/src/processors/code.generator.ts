import {
  GenericConfigObject,
  TangDocument,
  TangGenerator,
} from '@devs-tang/common';

import { normalizeDevkitProcessor } from './util';

/**
 * 代码生成器
 */
export const codeGenerator = (): TangGenerator => {
  return normalizeDevkitProcessor({
    type: 'generator',

    name: 'codegen',

    async generate(document: TangDocument, options: GenericConfigObject) {
      return document;
    },
  });
};

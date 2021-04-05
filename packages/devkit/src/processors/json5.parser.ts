import { TangDocument, TangParser, utils } from '@devs-tang/common';

import { json5 } from '../utils';
import { normalizeDevkitProcessor } from './util';

/**
 * Json解析器
 */
export const json5Parser = (): TangParser => {
  return normalizeDevkitProcessor({
    type: 'parser',

    name: 'json5',

    async parse(document: TangDocument) {
      if (!document.content) {
        document.model = {};
      } else if (utils.isObject(document.content)) {
        document.model = document.content;
      } else {
        document.model = json5.parse(document.content);
      }
      return document;
    },
  });
};

import { TangDocument, TangParser, utils } from '@devs-tang/common';
import { doc } from 'prettier';
import { normalizeCoreProcessor } from './util';

/**
 * Json解析器
 */
export const jsonParser = (): TangParser => {
  return normalizeCoreProcessor({
    type: 'parser',

    name: 'json',

    async parse(document: TangDocument) {
      if (!document.content) {
        document.model = {};
      } else if (utils.isObject(document.content)) {
        document.model = document.content;
      } else {
        document.model = JSON.parse(document.content);
      }

      return document;
    },
  });
};

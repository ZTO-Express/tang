import { DocumentModel, TangParser } from '@tang/common';

import { json5 } from '../utils';

/**
 * Json解析器
 */
export const json5Parser = (): TangParser => {
  return {
    type: 'parser',

    name: 'json5',

    async parse(content: string): Promise<DocumentModel> {
      const result = json5.parse(content);
      return result;
    },
  };
};

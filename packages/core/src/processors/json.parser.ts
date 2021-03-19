import { DocumentModel, TangParser } from '@tang/common';

/**
 * Json解析器
 */
export const jsonParser = (): TangParser => {
  return {
    type: 'parser',

    name: 'json',

    async parse(content: string | object): Promise<DocumentModel> {
      if (typeof content === 'object') return content;
      const result = JSON.parse(content);
      return result;
    },
  };
};

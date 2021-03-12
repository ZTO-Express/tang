import { DocumentModel, TangParser } from '@tang/common';

/**
 * Json解析器
 */
export const jsonParser = (): TangParser => {
  return {
    type: 'parser',

    name: 'json',

    async parse(content: string): Promise<DocumentModel> {
      const result = JSON.parse(content);
      return result;
    },
  };
};

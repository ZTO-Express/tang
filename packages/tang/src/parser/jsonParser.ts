import { TangDocumentModel, TangDocumentParser } from '../common/types';
import { json5 } from '../utils';

/**
 * Json解析器
 */
export const jsonParser = (): TangDocumentParser => {
  return {
    type: 'parser',

    name: 'json',

    async parse(content: string): Promise<TangDocumentModel> {
      const result = json5.parse(content);
      return result;
    },
  };
};

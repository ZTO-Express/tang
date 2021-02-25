import { TangDocumentModel } from '../tang/types';
import { json5 } from '../utils';

/**
 * Json解析器
 */
export const jsonParser = () => {
  return {
    name: 'json',

    async parse(content: string): Promise<TangDocumentModel> {
      const result = json5.parse(content);
      return result;
    },
  };
};

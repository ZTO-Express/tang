import { DocumentModel } from '../tang/types';
import { json5 } from '../utils';

/**
 * Json解析器
 */
export const jsonParser = {
  name: 'json',

  async parse(content: string): Promise<DocumentModel> {
    const result = json5.parse(content);
    return result;
  },
};

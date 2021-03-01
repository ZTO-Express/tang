import { TangModel, TangParser } from '../common/types';
import { json5 } from '../utils';

/**
 * Json解析器
 */
export const jsonParser = (): TangParser => {
  return {
    type: 'parser',

    name: 'json',

    async parse(content: string): Promise<TangModel> {
      const result = json5.parse(content);
      return result;
    },
  };
};

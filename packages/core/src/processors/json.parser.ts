import { TangParser } from '@devs-tang/common';
import { normalizeCoreProcessor } from './util';

/**
 * Json解析器
 */
export const jsonParser = (): TangParser => {
  return normalizeCoreProcessor({
    type: 'parser',

    name: 'json',

    async parse(content: string | object) {
      if (typeof content === 'object') return content;
      const result = JSON.parse(content);
      return result;
    },
  });
};

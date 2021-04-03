import { TangParser } from '@devs-tang/common';

import { json5 } from '../utils';
import { normalizeDevkitProcessor } from './util';

/**
 * Json解析器
 */
export const json5Parser = (): TangParser => {
  return normalizeDevkitProcessor({
    type: 'parser',

    name: 'json5',

    async parse(content: string) {
      if (typeof content !== 'string') return content;

      const result = json5.parse(content);
      return result;
    },
  });
};

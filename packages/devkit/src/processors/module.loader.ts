import { TangLoader, utils } from '@devs-tang/common';
import { normalizeDevkitProcessor } from './util';

/**
 * 通过加载js模块
 */
export const moduleLoader = (): TangLoader => {
  return normalizeDevkitProcessor({
    type: 'loader',

    name: 'module',

    test: (entry: string) =>
      utils.isAbsolutePath(entry) &&
      (entry.endsWith('.js') || entry.endsWith('.json')),

    async load(entry: string): Promise<any> {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const result = require(entry);
      return result;
    },
  });
};

import {
  TangCompilation,
  TangDocument,
  TangLoader,
  utils,
} from '@devs-tang/common';
import { normalizeDevkitProcessor } from './util';

/**
 * 通过加载js模块
 */
export const moduleLoader = (): TangLoader => {
  return normalizeDevkitProcessor({
    type: 'loader',

    name: 'module',

    test: (compilation: TangCompilation) => {
      const entry = compilation.entry;
      return (
        entry &&
        utils.isAbsolutePath(entry) &&
        (entry.endsWith('.js') || entry.endsWith('.json'))
      );
    },

    async load(document: TangDocument): Promise<any> {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      document.content = require(document.entry);
      return document;
    },
  });
};

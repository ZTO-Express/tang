import {
  GenericConfigObject,
  TangCompilation,
  TangDocument,
  TangLoader,
  utils,
} from '@devs-tang/common';

import { fs } from '../utils';
import { normalizeDevkitProcessor } from './util';

/**
 * 本地文件加载器
 */
export const docLoader = (): TangLoader => {
  return normalizeDevkitProcessor({
    type: 'loader',

    name: 'doc',

    test: (compilation: TangCompilation) =>
      compilation &&
      (utils.isAbsolutePath(compilation.entry) ||
        utils.isUrl(compilation.entry)),

    async load(
      document: TangDocument,
      options?: GenericConfigObject,
    ): Promise<any> {
      const encoding = options?.encoding;
      document.content = await fs.resolveFile(document.entry, encoding);

      return document;
    },
  });
};

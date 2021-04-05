import {
  TangCompilation,
  TangDocument,
  TangLoader,
  utils,
} from '@devs-tang/common';

import { http } from '../utils';
import { normalizeCoreProcessor } from './util';

/**
 * 通过url加载文件
 */
export const urlLoader = (): TangLoader => {
  return normalizeCoreProcessor({
    type: 'loader',

    name: 'url',

    test: (compilation: TangCompilation) =>
      compilation && utils.isUrl(compilation.entry),

    async load(document: TangDocument, options?: http.HttpRequestOptions) {
      document.content = await http.request(document.entry, options);
      return document;
    },
  });
};

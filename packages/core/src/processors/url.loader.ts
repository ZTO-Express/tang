import { TangLoader, utils } from '@tang/common';

import { http } from '../utils';

/**
 * 通过url加载文件
 */
export const urlLoader = (): TangLoader => {
  return {
    type: 'loader',

    name: 'url',

    test: (entry: string) => utils.isUrl(entry),

    async load<T>(
      entry: string,
      options?: http.HttpRequestOptions,
    ): Promise<T> {
      const result = await http.request<T>(entry, options);
      return result;
    },
  };
};

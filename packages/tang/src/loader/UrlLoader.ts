import { GenericConfigObject } from '../tang/types';

/**
 * 通过url加载文件
 */
export const UrlLoader = {
  name: 'url',
  test: '',
  async load(
    entry: string,
    options?: GenericConfigObject,
  ): Promise<string | Buffer> {
    return '';
  },
};

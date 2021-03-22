import { GenericConfigObject, TangLoader, utils } from '@tang/common';
import { fs } from '../utils';

/**
 * 本地文件加载器
 */
export const docLoader = (): TangLoader => {
  return {
    type: 'loader',

    name: 'doc',

    test: (entry: string) => utils.isAbsolutePath(entry) || utils.isUrl(entry),

    async load(entry: string, options?: GenericConfigObject): Promise<any> {
      const encoding = options?.encoding;
      const result = await fs.resolveFile(entry, encoding);
      return result;
    },
  };
};

import { GenericConfigObject, TangLoader, utils } from '@tang/common';
import { fs } from '../utils';

/**
 * 本地文件加载器
 */
export const localLoader = (): TangLoader => {
  return {
    type: 'loader',

    name: 'local',

    test: (entry: string) => utils.isAbsolutePath(entry),

    async load(
      entry: string,
      options?: GenericConfigObject,
    ): Promise<string | Buffer> {
      const buffer = await fs.readFile(entry, options);
      const text = buffer.toString();
      return text;
    },
  };
};

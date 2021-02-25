import { check, fs } from '../utils';
import { GenericConfigObject } from '../tang/types';

/**
 * 本地文件加载器
 */
export const localLoader = () => {
  return {
    name: 'local',

    test: (entry: string) => check.isAbsolutePath(entry),

    async load(entry: string, options?: GenericConfigObject): Promise<string> {
      const buffer = await fs.readFile(entry, options);
      const text = buffer.toString();
      return text;
    },
  };
};

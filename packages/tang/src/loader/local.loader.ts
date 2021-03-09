import { GenericConfigObject, TangLoader } from '../@types';
import { isAbsolutePath, fs } from '../utils';

/**
 * 本地文件加载器
 */
export const localLoader = (): TangLoader => {
  return {
    type: 'loader',

    name: 'local',

    test: (entry: string) => isAbsolutePath(entry),

    async load(entry: string, options?: GenericConfigObject): Promise<string> {
      const buffer = await fs.readFile(entry, options);
      const text = buffer.toString();
      return text;
    },
  };
};

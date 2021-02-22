import { DocumentLoader, GenericConfigObject } from '@/tang/types';
import { check, fs } from '../utils';

/**
 * 本地文件加载器
 */
export const LocalLoader: DocumentLoader = {
  name: 'local',
  test: (entry: string) => {
    return check.isAbsolutePath(entry) && fs.pathExistsSync(entry);
  },
  async load(
    entry: string,
    options?: GenericConfigObject,
  ): Promise<string | Buffer> {
    return '';
  },
};

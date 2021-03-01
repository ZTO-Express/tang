import { fs } from 'memfs';
import { Volume } from 'memfs/lib/volume';

export * from 'memfs';

/**
 * 文件目录是否存在
 * @param fsPath 文件系统路径
 */
export async function dirExists(fsPath: string, vol?: Volume) {
  const _fs = (vol ? vol : fs).promises;

  const flag = await _fs
    .lstat(fsPath)
    .then(res => res && res.isDirectory())
    .catch(() => false);

  return flag;
}

/**
 * 文件是否存在
 * @param fsPath 文件系统路径
 */
export async function fileExists(fsPath: string, vol?: Volume) {
  const _fs = (vol ? vol : fs).promises;

  const flag = await _fs
    .lstat(fsPath)
    .then(res => res && res.isFile())
    .catch(() => false);

  return flag;
}

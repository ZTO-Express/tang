import * as testUtil from '../../util';
import { TANG_CONFIG_FILENAME } from '../../../src/consts';
import { ConfigManager } from '../../../src/lib/config';
import { LocalLoader } from '../../../src/lib/loaders';

const tangUtil = testUtil.tangUtil;

describe('tang/cli/local.loader：本地加载器', () => {
  const tmpDir = testUtil.resolveTmpDir();
  const localLoader = new LocalLoader(tmpDir);

  beforeEach(async () => {
    await tangUtil.fs.ensureDir(tmpDir);
    await tangUtil.fs.emptyDir(tmpDir);
  });

  it('read 加载器读写操作', async () => {
    // 列出空目录
    const files = await localLoader.list();
    expect(files.length).toBe(0);
    expect(localLoader.loadDirectory).toBe(tmpDir);
    expect(localLoader.loadFile).toBeUndefined();

    // 读取空目录
    await expect(() => localLoader.read()).rejects.toThrow();
    expect(localLoader.loadDirectory).toBe(tmpDir);
    expect(localLoader.loadFile).toBeUndefined();

    // 读取不存在的文件
    await expect(() =>
      localLoader.read(TANG_CONFIG_FILENAME),
    ).rejects.toThrow();
    expect(localLoader.loadDirectory).toBe(tmpDir);
    expect(localLoader.loadFile).toBeUndefined();

    // 读取空文件
    const text0 = await localLoader.readAnyOf([]);
    expect(text0).toBeUndefined();
    expect(localLoader.loadDirectory).toBe(tmpDir);
    expect(localLoader.loadFile).toBeUndefined();

    // 读取任意文件
    const text1 = await localLoader.readAnyOf([
      'error.txt',
      TANG_CONFIG_FILENAME,
    ]);
    expect(text1).toBeUndefined();
    expect(localLoader.loadDirectory).toBe(tmpDir);
    expect(localLoader.loadFile).toBeUndefined();

    // 写空文件
    await expect(() => localLoader.write({})).rejects.toThrow();
    expect(localLoader.loadDirectory).toBe(tmpDir);
    expect(localLoader.loadFile).toBeUndefined();

    // 写指定文件
    await localLoader.write('test_file', TANG_CONFIG_FILENAME);
    expect(localLoader.loadDirectory).toBe(tmpDir);
    expect(localLoader.loadFile).toBe(TANG_CONFIG_FILENAME);

    const files1 = await localLoader.list();
    expect(files1.length).toBe(1);

    const text = await localLoader.read(TANG_CONFIG_FILENAME);
    expect(text).toBe('test_file');
    expect(localLoader.loadDirectory).toBe(tmpDir);
    expect(localLoader.loadFile).toBe(TANG_CONFIG_FILENAME);

    const text2 = await localLoader.readAnyOf([
      'no-exists.json',
      TANG_CONFIG_FILENAME,
    ]);

    expect(text2).toBe('test_file');
    expect(localLoader.loadDirectory).toBe(tmpDir);
    expect(localLoader.loadFile).toBe(TANG_CONFIG_FILENAME);

    const text3 = await localLoader.readAnyOf([
      'no-exists1.json',
      'no-exists2.json',
    ]);
    expect(text3).toBeUndefined();
    expect(localLoader.loadDirectory).toBe(tmpDir);
    expect(localLoader.loadFile).toBe(TANG_CONFIG_FILENAME);

    await tangUtil.fs.emptyDir(tmpDir);
  });
});

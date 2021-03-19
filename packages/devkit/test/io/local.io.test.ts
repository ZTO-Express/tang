import * as testUtil from '../util';
import { TANG_CONFIG_FILENAME } from '../../src/consts';
import { LocalIO } from '../../src/io';

describe('tang/core/local.loader：本地加载器', () => {
  const tmpDir = testUtil.resolveTmpDir();
  const localIO = new LocalIO(tmpDir);

  beforeEach(async () => {
    await testUtil.fs.ensureDir(tmpDir);
    await testUtil.fs.emptyDir(tmpDir);
  });

  it('read 加载器读写操作', async () => {
    // 列出空目录
    const files = await localIO.list();
    expect(files.length).toBe(0);
    expect(localIO.loadDirectory).toBe(tmpDir);
    expect(localIO.loadFile).toBeUndefined();

    // 读取空目录
    await expect(() => localIO.read()).rejects.toThrow();
    expect(localIO.loadDirectory).toBe(tmpDir);
    expect(localIO.loadFile).toBeUndefined();

    // 读取不存在的文件
    await expect(() => localIO.read(TANG_CONFIG_FILENAME)).rejects.toThrow();
    expect(localIO.loadDirectory).toBe(tmpDir);
    expect(localIO.loadFile).toBeUndefined();

    // 读取空文件
    const text0 = await localIO.readAnyOf([]);
    expect(text0).toBeUndefined();
    expect(localIO.loadDirectory).toBe(tmpDir);
    expect(localIO.loadFile).toBeUndefined();

    // 读取任意文件
    const text1 = await localIO.readAnyOf(['error.txt', TANG_CONFIG_FILENAME]);
    expect(text1).toBeUndefined();
    expect(localIO.loadDirectory).toBe(tmpDir);
    expect(localIO.loadFile).toBeUndefined();

    // 写空文件
    await expect(() => localIO.write({})).rejects.toThrow();
    expect(localIO.loadDirectory).toBe(tmpDir);
    expect(localIO.loadFile).toBeUndefined();

    // 写指定文件
    await localIO.write('test_file', TANG_CONFIG_FILENAME);
    expect(localIO.loadDirectory).toBe(tmpDir);
    expect(localIO.loadFile).toBe(TANG_CONFIG_FILENAME);

    const files1 = await localIO.list();
    expect(files1.length).toBe(1);

    const text = await localIO.read(TANG_CONFIG_FILENAME);
    expect(text).toBe('test_file');
    expect(localIO.loadDirectory).toBe(tmpDir);
    expect(localIO.loadFile).toBe(TANG_CONFIG_FILENAME);

    await testUtil.fs.emptyDir(tmpDir);
  });

  it('read 加载器读写操作 readAnyOf', async () => {
    await localIO.write('test_file', TANG_CONFIG_FILENAME);

    const text2 = await localIO.readAnyOf([
      'no-exists.json',
      TANG_CONFIG_FILENAME,
    ]);

    expect(text2).toBe('test_file');
    expect(localIO.loadDirectory).toBe(tmpDir);
    expect(localIO.loadFile).toBe(TANG_CONFIG_FILENAME);

    const text3 = await localIO.readAnyOf([
      'no-exists1.json',
      'no-exists2.json',
    ]);
    expect(text3).toBeUndefined();
    expect(localIO.loadDirectory).toBe(tmpDir);
    expect(localIO.loadFile).toBe(TANG_CONFIG_FILENAME);
  });
});

import { memfs } from '../../src/utils';

describe('utils/memfs：memfs实用方法', () => {
  it('检查目录是否存在', async () => {
    const testDirPath = './test';

    let existsTestDir = await memfs.dirExists(testDirPath);
    expect(existsTestDir).toBe(false);
    existsTestDir = await memfs.fileExists(testDirPath);
    expect(existsTestDir).toBe(false);

    await memfs.fs.promises.mkdir(testDirPath, { recursive: true });

    existsTestDir = await memfs.dirExists(testDirPath);
    expect(existsTestDir).toBe(true);
    existsTestDir = await memfs.fileExists(testDirPath);
    expect(existsTestDir).toBe(false);

    // 自定义volumn
    const vol = memfs.Volume.fromJSON({});

    existsTestDir = await memfs.dirExists(testDirPath, vol);
    expect(existsTestDir).toBe(false);
    existsTestDir = await memfs.fileExists(testDirPath, vol);
    expect(existsTestDir).toBe(false);

    await vol.promises.mkdir(testDirPath, { recursive: true });

    existsTestDir = await memfs.dirExists(testDirPath, vol);
    expect(existsTestDir).toBe(true);
    existsTestDir = await memfs.fileExists(testDirPath, vol);
    expect(existsTestDir).toBe(false);
  });

  it('检查文件是否存在', async () => {
    const testFilePath = './test.txt';

    let existsTestPath = await memfs.dirExists(testFilePath);
    expect(existsTestPath).toBe(false);
    existsTestPath = await memfs.fileExists(testFilePath);
    expect(existsTestPath).toBe(false);

    await memfs.fs.promises.mkdir('./', { recursive: true });
    await memfs.fs.promises.writeFile(testFilePath, 'test_str');

    existsTestPath = await memfs.dirExists(testFilePath);
    expect(existsTestPath).toBe(false);
    existsTestPath = await memfs.fileExists(testFilePath);
    expect(existsTestPath).toBe(true);

    // 自定义volumn
    const vol = memfs.Volume.fromJSON({});

    existsTestPath = await memfs.dirExists(testFilePath, vol);
    expect(existsTestPath).toBe(false);
    existsTestPath = await memfs.fileExists(testFilePath, vol);
    expect(existsTestPath).toBe(false);

    await vol.promises.mkdir('./', { recursive: true });
    await vol.promises.writeFile(testFilePath, 'test_str');

    existsTestPath = await memfs.dirExists(testFilePath, vol);
    expect(existsTestPath).toBe(false);
    existsTestPath = await memfs.fileExists(testFilePath, vol);
    expect(existsTestPath).toBe(true);
  });
});

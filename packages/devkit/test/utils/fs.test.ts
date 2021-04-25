import { utils } from '@devs-tang/common';
import * as os from 'os';

import { fs } from '../../src/utils';
import * as testUtil from '../util';

describe('utils/fs：fs实用方法', () => {
  it('从本地目录获取文件', async () => {
    const packagePath = testUtil.resolvePackagePath(true);

    let fileData = await fs.resolveFile(packagePath, 'json');
    expect(fileData.name).toBe('@devs-tang/devkit');

    fileData = await fs.resolveFile('/noneExists', 'json');
    expect(fileData).toBeUndefined();
  });

  it('同步读取json5文件 readJSON5Sync', async () => {
    expect(fs.readJSON5Sync(undefined)).toBeUndefined();
    expect(fs.readJSON5Sync('./noneExists')).toBeUndefined();

    const json5Path = testUtil.resolveFixturePath('documents/preset.json');
    expect(fs.readJSON5Sync(json5Path).name).toEqual('@tang/yapi-sharing');
  });

  it('读取packageInfo readPackageInfo', async () => {
    const packageDir = testUtil.resolvePackagePath(false);

    let packageInfo = await fs.readPackageInfo(packageDir);
    expect(packageInfo.name).toBe('@devs-tang/devkit');

    packageInfo = await fs.readPackageInfo(packageDir + '/package.json');
    expect(packageInfo.name).toBe('@devs-tang/devkit');

    packageInfo = await fs.readPackageInfo(undefined);
    expect(packageInfo).toBeUndefined();

    packageInfo = await fs.readPackageInfo('../nonExists');
    expect(packageInfo).toBeUndefined();

    packageInfo = await fs.readPackageInfo(__dirname);
    expect(packageInfo).toBeUndefined();
  });

  it('从url获取文件', async () => {
    await expect(fs.resolveFile('ftp://www.example.com')).rejects.toThrow(
      '无效文件路径',
    );

    const blankUrl = testUtil.resolveFixtureUrl('blank');
    const blankText = await fs.resolveFile(blankUrl);
    expect(blankText).toBe('');

    const yfDocUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.v0.1.json',
    );
    const yfDocTitle = 'yapi文档生成';

    expect(utils.isUrl(yfDocUrl)).toBeTruthy();

    const meshText = await fs.resolveFile(yfDocUrl);
    expect(meshText).toMatch(yfDocTitle);

    const meshJson = await fs.resolveFile(yfDocUrl, 'json');
    expect(meshJson.title).toEqual(yfDocTitle);

    const meshBuffer = await fs.resolveFile(yfDocUrl, 'buffer');
    expect(meshBuffer).toBeInstanceOf(ArrayBuffer);
    expect(meshBuffer.byteLength).toBeGreaterThan(10);
  });

  it('打开文件', async () => {
    // 尝试打开explore
    const result = await fs.explore(os.homedir());

    if (os.platform() === 'win32') {
      expect(result.exitCode).toBe(1);
    } else {
      expect(result.exitCode).toBe(0);
    }

    await expect(fs.explore(os.homedir(), 'badCommand')).rejects.toThrow();
  });

  it('获取文件浏览器 getFileExplorer', async () => {
    const osPlatformFn = os.platform;

    const osAny = os as any;

    osAny.platform = () => 'darwin';
    expect(fs.getFileExplorer()).toBe('open');

    osAny.platform = () => 'win32';
    expect(fs.getFileExplorer()).toBe('explorer');

    osAny.platform = () => 'linux';
    expect(fs.getFileExplorer()).toBe('nautilus');

    osAny.platform = () => 'unknown';
    expect(fs.getFileExplorer()).toBe(undefined);

    await expect(fs.explore(os.homedir())).rejects.toThrow('无法确定执行命令');

    osAny.platform = osPlatformFn;
  });

  it('相对路径 relativePath', async () => {
    expect(fs.relativePath('/aaa/b', '/aaa/b/c')).toBe('c');
    expect(fs.relativePath('/aaa/b', '/aaa/b')).toBe('');
    expect(fs.relativePath('/aaa/b', '/aaa')).toBe('..');

    expect(fs.relativePath('/aaa/b', '/aaa/c/xxx')).toBe(
      fs.joinPath('..', 'c', 'xxx'),
    );
  });

  it('父路径 parentPath', async () => {
    expect(fs.parentPath('/aaa/b/c')).toBe('/aaa/b');
    expect(fs.parentPath('/aaa/b/c.jpg')).toBe('/aaa/b');
    expect(fs.parentPath('/aaa/b')).toBe('/aaa');
    expect(fs.parentPath('/aaa')).toBe('/');
    expect(fs.parentPath('/')).toBe(undefined);
    expect(fs.parentPath('')).toBe(undefined);
    expect(fs.parentPath('.')).toBe(undefined);
    expect(fs.parentPath(undefined)).toBe(undefined);
    expect(fs.parentPath('a')).toBe('.');
    expect(fs.parentPath('..')).toBe('.');
    expect(fs.parentPath('/..')).toBe('/');
  });

  it('同步遍历目录 walkSync', async () => {
    const parentDir = fs.joinPath(__dirname, '..');
    const testFile = fs.joinPath(__dirname, 'fs.test.ts');

    const files: string[] = [];
    fs.walkSync(parentDir, (filePath: string) => {
      files.push(filePath);
    });

    expect(files.includes(testFile)).toBe(true);
  });

  it('向上寻找 lookupFile', async () => {
    const packagePath = fs.joinPath(__dirname, '../../package.json');
    const lookupPath = await fs.lookupFile('package.json', __dirname);
    expect(lookupPath).toBe(packagePath);
  });

  it('向上寻找 lookupFile', async () => {
    let fileData = await fs.resolveAnyOf(
      [
        'nonExists',
        fs.joinPath(__dirname, 'nonExist'),
        fs.joinPath(__dirname, '../../package.json'),
        testUtil.resolveFixturePath('documents/preset.json'),
      ],
      'json',
    );
    expect(fileData.name).toBe('@devs-tang/devkit');

    fileData = await fs.resolveAnyOf(
      [
        'nonExists',
        testUtil.resolveFixturePath('documents/preset.json'),
        fs.joinPath(__dirname, 'nonExist'),
        fs.joinPath(__dirname, '../../package.json'),
      ],
      'json',
    );
    expect(fileData.name).toBe('@tang/yapi-sharing');

    fileData = await fs.resolveAnyOf(
      ['nonExists', fs.joinPath(__dirname, 'nonExist')],
      'json',
    );
    expect(fileData).toBeUndefined();
  });
});

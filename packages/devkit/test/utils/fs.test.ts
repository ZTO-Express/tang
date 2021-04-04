import { utils } from '@devs-tang/common';
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
});

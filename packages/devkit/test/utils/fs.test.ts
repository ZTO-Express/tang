import { utils } from '@tang/common';
import { fs } from '../../src/utils';
import * as testUtil from '../util';

describe('utils/fs：fs实用方法', () => {
  it('从本地目录获取文件', async () => {
    const yfDocPath = testUtil.resolveFixturePath(
      'meshs/yapi-fsharing/mesh.json',
    );

    const meshContent = await fs.resolveFile(yfDocPath, 'json');

    expect(meshContent.name).toEqual('@tang/yapi-sharing');
  });

  it('从url获取文件', async () => {
    await expect(fs.resolveFile('ftp://www.example.com')).rejects.toThrow(
      '无效文件路径',
    );

    const blankUrl = testUtil.resolveFixtureUrl('blank');
    const blankText = await fs.resolveFile(blankUrl);
    expect(blankText).toBe('');

    const yfDocUrl = testUtil.resolveFixtureUrl(
      'meshs/yapi-fsharing/mesh.json',
    );
    expect(utils.isUrl(yfDocUrl)).toBeTruthy();

    const meshText = await fs.resolveFile(yfDocUrl);
    expect(meshText).toMatch('@tang/yapi-sharing');

    const meshJson = await fs.resolveFile(yfDocUrl, 'json');
    expect(meshJson.name).toEqual('@tang/yapi-sharing');

    const meshBuffer = await fs.resolveFile(yfDocUrl, 'buffer');
    expect(meshBuffer).toBeInstanceOf(ArrayBuffer);
    expect(meshBuffer.byteLength).toBeGreaterThan(10);
  });
});

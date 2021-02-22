import { fs, check } from '../../src/utils';
import * as testUtil from '../util';

describe('utils/fs：fs实用方法', () => {
  it('从本地目录获取文件', async () => {
    const yfPresetPath = testUtil.resolveFixturePath(
      'presets/yapi-fsharing/preset.json',
    );

    const presetContent = await fs.resolveFile(yfPresetPath, 'json');

    expect(presetContent.name).toEqual('@tang/yapi-sharing');
  });

  it('从url获取文件', async () => {
    const yfPresetUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.json',
    );

    expect(check.isUrl(yfPresetUrl)).toBeTruthy();

    const presetContent = await fs.resolveFile(yfPresetUrl, 'json');

    expect(presetContent.name).toEqual('@tang/yapi-sharing');
  });
});

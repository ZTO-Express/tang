import { fs, isUrl } from '../../src/utils';
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
    await expect(fs.resolveFile('ftp://www.example.com')).rejects.toThrow(
      '无效文件路径',
    );

    const blankUrl = testUtil.resolveFixtureUrl('blank');
    const blankText = await fs.resolveFile(blankUrl);
    expect(blankText).toBe('');

    const yfPresetUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.json',
    );
    expect(isUrl(yfPresetUrl)).toBeTruthy();

    const presetText = await fs.resolveFile(yfPresetUrl);
    expect(presetText).toMatch('@tang/yapi-sharing');

    const presetJson = await fs.resolveFile(yfPresetUrl, 'json');
    expect(presetJson.name).toEqual('@tang/yapi-sharing');

    const presetBuffer = await fs.resolveFile(yfPresetUrl, 'buffer');
    expect(presetBuffer).toBeInstanceOf(Buffer);
    expect(presetBuffer.toString()).toMatch('@tang/yapi-sharing');

    // const preset2Json = await fs.resolveFile(
    //   './test/fixtures/presets/yapi-fsharing/preset.json',
    //   'json',
    // );
    // expect(preset2Json.name).toEqual('@tang/yapi-sharing');
  });
});

import * as testUtil from '../util';
import { json5 } from '../../src/utils';
import * as loader from '../../src/loader';

describe('loader/url：url加载器', () => {
  const urlLoader = loader.urlLoader();

  it('urlLoader test方法', async () => {
    // 路径必须为绝对路径，并且存在
    expect(urlLoader.test('../fixture/presets/')).toBeFalsy();
    expect(urlLoader.test('http://www.example.org')).toBeTruthy();

    const yfPresetUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.json',
    );

    expect(urlLoader.test(yfPresetUrl)).toBeTruthy();
  });

  it('urlLoader load方法', async () => {
    const yfPresetUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.json',
    );

    const result = await urlLoader.load(yfPresetUrl);
    expect(result.length).toBeGreaterThan(10);

    const resultJson = json5.parse(result);
    expect(resultJson.name).toBe('@tang/yapi-sharing');
  });

  it('urlLoader load方法 文件不存在', async () => {
    const yfPresetUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.json1',
    );

    await expect(urlLoader.load(yfPresetUrl)).rejects.toThrowError(
      /not found/i,
    );
  });
});

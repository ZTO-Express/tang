import * as testUtil from '../util';
import { json5 } from '../../src/utils';
import { localLoader } from '../../src/loader';

describe('loader/local：local加载器', () => {
  it('localLoader test方法', async () => {
    // 路径必须为绝对路径，并且存在
    expect(localLoader.test('../fixture/presets/')).toBeFalsy();
    expect(localLoader.test('http://www.example.org')).toBeFalsy();
    expect(localLoader.test('xxxx')).toBeFalsy();
    expect(
      localLoader.test('../fixture/presets/yapi-fsharing/preset.json'),
    ).toBeFalsy();

    const yfPresetPath = testUtil.resolveFixturePath(
      'presets/yapi-fsharing/preset.json',
    );

    expect(localLoader.test(yfPresetPath)).toBeTruthy();
  });

  it('localLoader load方法', async () => {
    const yfPresetPath = testUtil.resolveFixturePath(
      'presets/yapi-fsharing/preset.json',
    );

    const content = await localLoader.load(yfPresetPath);

    expect(content.length).toBeGreaterThan(10);
    const contentJson = json5.parse(content);
    expect(contentJson.name).toBe('@tang/yapi-sharing');
  });

  it('localLoader load方法 文件不存在', async () => {
    const yfPresetPath = testUtil.resolveFixturePath(
      'presets/yapi-fsharing/preset.json1',
    );

    expect(localLoader.load(yfPresetPath)).rejects.toThrowError(
      /no such file or directory/i,
    );
  });
});

import * as testUtil from '../util';
import { json5 } from '../../src/utils';
import * as loader from '../../src/loader';

describe('loader/local：local加载器', () => {
  const localLoader = loader.localLoader();

  it('localLoader test方法', async () => {
    const loaderTest: any = localLoader.test;

    // 路径必须为绝对路径，并且存在
    expect(loaderTest('../fixture/presets/')).toBeFalsy();
    expect(loaderTest('http://www.example.org')).toBeFalsy();
    expect(loaderTest('xxxx')).toBeFalsy();
    expect(
      loaderTest('../fixture/presets/yapi-fsharing/preset.json'),
    ).toBeFalsy();

    const yfPresetPath = testUtil.resolveFixturePath(
      'presets/yapi-fsharing/preset.json',
    );

    expect(loaderTest(yfPresetPath)).toBeTruthy();
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

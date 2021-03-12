import * as testUtil from '../util';
import * as processors from '../../src/processors';

describe('loader/url：url加载器', () => {
  const urlLoader = processors.urlLoader();

  it('urlLoader test方法', async () => {
    const loaderTest: any = urlLoader.test;
    // 路径必须为绝对路径，并且存在
    expect(loaderTest('../fixture/presets/')).toBeFalsy();
    expect(loaderTest('http://www.example.org')).toBeTruthy();

    const yfPresetUrl = testUtil.resolveFixtureUrl('preset.json');

    expect(loaderTest(yfPresetUrl)).toBeTruthy();
  });

  it('urlLoader load方法', async () => {
    const yfPresetUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.v0.1.json',
    );

    const text: string = await urlLoader.load(yfPresetUrl, { type: 'text' });

    expect(text.length).toBeGreaterThan(10);
    const textJson = JSON.parse(text);
    expect(textJson.name).toBe('@tang/yapi-sharing');

    const json = await urlLoader.load<any>(yfPresetUrl, { type: 'json' });
    expect(json.name).toBe('@tang/yapi-sharing');

    const def = await urlLoader.load<any>(yfPresetUrl);
    expect(def.name).toBe('@tang/yapi-sharing');

    const blob = await urlLoader.load<Blob>(yfPresetUrl, { type: 'blob' });
    expect(blob.type).toBe('application/json');
    expect(blob.size).toBeGreaterThan(10);

    const buffer = await urlLoader.load<ArrayBuffer>(yfPresetUrl, {
      type: 'buffer',
    });
    expect(buffer.byteLength).toBeGreaterThan(10);

    const unknown = await urlLoader.load<any>('https://www.baidu.com');
    expect(typeof unknown).toBe('string');
    expect(unknown.length).toBeGreaterThan(10);
  });

  it('urlLoader load方法 文件不存在', async () => {
    await expect(() =>
      urlLoader.load('https://www.baidu.com/xxx'),
    ).rejects.toThrowError(/not found/i);

    const yfPresetUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.json1',
    );

    await expect(urlLoader.load(yfPresetUrl)).rejects.toThrowError(
      /not found/i,
    );
  });
});

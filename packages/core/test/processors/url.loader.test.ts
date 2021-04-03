import * as testUtil from '../util';
import * as processors from '../../src/processors';
import { normalizeProcessor } from '../../src';

describe('loader/url：url加载器', () => {
  const urlLoader = processors.urlLoader();

  it('urlLoader normalize方法', async () => {
    expect(
      normalizeProcessor(
        {
          name: 'url',
          test: urlLoader.test,
          load: urlLoader.load,
        },
        {
          type: 'loader',
          moduleType: 'core',
        },
      ),
    ).toEqual(urlLoader);
  });

  it('urlLoader test方法', async () => {
    const loaderTest: any = urlLoader.test;
    // 路径必须为绝对路径，并且存在
    expect(loaderTest('../fixture/')).toBeFalsy();
    expect(loaderTest('http://www.example.org')).toBeTruthy();

    const yfDocUrl = testUtil.resolveFixtureUrl('mesh.json');

    expect(loaderTest(yfDocUrl)).toBeTruthy();
  });

  it('urlLoader load方法', async () => {
    const yfDocUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.v0.1.json',
    );

    const yfDocTitle = 'yapi文档生成';

    const text = (await urlLoader.load(yfDocUrl, {
      type: 'text',
    })) as string;

    expect(text.length).toBeGreaterThan(10);
    const textJson = JSON.parse(text);
    expect(textJson.title).toBe(yfDocTitle);

    const json = await urlLoader.load<any>(yfDocUrl, { type: 'json' });
    expect(json.title).toBe(yfDocTitle);

    const def = await urlLoader.load<any>(yfDocUrl);
    expect(def.title).toBe(yfDocTitle);

    const blob = await urlLoader.load<Blob>(yfDocUrl, { type: 'blob' });
    expect(blob.type).toBe('application/json');
    expect(blob.size).toBeGreaterThan(10);

    const buffer = await urlLoader.load<ArrayBuffer>(yfDocUrl, {
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

    const yfDocUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.json1',
    );

    await expect(urlLoader.load(yfDocUrl)).rejects.toThrowError(/not found/i);
  });
});

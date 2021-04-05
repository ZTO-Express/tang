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
    expect(loaderTest({ entry: '../fixture/' })).toBeFalsy();
    expect(loaderTest({ entry: 'http://www.example.org' })).toBeTruthy();

    const yfDocUrl = testUtil.resolveFixtureUrl('mesh.json');

    expect(loaderTest({ entry: yfDocUrl })).toBeTruthy();
  });

  it('urlLoader load方法', async () => {
    const yfDocUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.v0.1.json',
    );

    const yfDocTitle = 'yapi文档生成';

    let document = await urlLoader.load(
      { entry: yfDocUrl },
      {
        type: 'text',
      },
    );

    expect(document.content.length).toBeGreaterThan(10);
    const textJson = JSON.parse(document.content);
    expect(textJson.title).toBe(yfDocTitle);

    document = await urlLoader.load({ entry: yfDocUrl }, { type: 'json' });
    expect(document.content.title).toBe(yfDocTitle);

    document = await urlLoader.load({ entry: yfDocUrl });
    expect(document.content.title).toBe(yfDocTitle);

    document = await urlLoader.load({ entry: yfDocUrl }, { type: 'blob' });

    expect(document.content.type).toBe('application/json');
    expect(document.content.size).toBeGreaterThan(10);

    document = await urlLoader.load(
      { entry: yfDocUrl },
      {
        type: 'buffer',
      },
    );
    expect(document.content.byteLength).toBeGreaterThan(10);

    document = await urlLoader.load({ entry: 'https://www.baidu.com' });
    expect(typeof document.content).toBe('string');
    expect(document.content.length).toBeGreaterThan(10);
  });

  it('urlLoader load方法 文件不存在', async () => {
    await expect(() =>
      urlLoader.load({ entry: 'https://www.baidu.com/xxx' }),
    ).rejects.toThrowError(/not found/i);

    const yfDocUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/nonExists.json1',
    );

    await expect(urlLoader.load({ entry: yfDocUrl })).rejects.toThrowError(
      /not found/i,
    );
  });
});

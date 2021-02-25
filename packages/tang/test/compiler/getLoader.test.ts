import { Compiler } from '../../src/compiler';

import * as loader from '../../src/loader';
import * as parser from '../../src/parser';

describe('compiler/loader：获取加载器 getLoader', () => {
  const urlLoader = loader.urlLoader();
  const localLoader = loader.localLoader();

  const jsonParser = parser.jsonParser();
  const yamlParser = parser.yamlParser();

  let compiler1: Compiler;
  let compiler2: Compiler;

  beforeAll(() => {
    compiler1 = new Compiler({
      loaders: [urlLoader, localLoader],
      parsers: [jsonParser, yamlParser],
    });

    compiler2 = new Compiler({
      defaultLoader: 'local',
      loaders: [urlLoader, localLoader],
      parsers: [jsonParser, yamlParser],
    });
  });

  it('验证 getLoader by name', async () => {
    const loader = compiler1.getLoader({ loader: 'local' });
    expect(loader).not.toBe(localLoader);
    expect(loader.name).toBe(localLoader.name);
    expect(loader.load).toBe(localLoader.load);
    expect(loader.test).toBe(localLoader.test);

    expect(compiler1.getLoader({ loader: 'xxx' })).toBeUndefined();
  });

  it('验证 getLoader by instance', async () => {
    const loader = compiler1.getLoader({ loader: urlLoader });

    expect(loader).not.toBe(urlLoader);
    expect(loader.name).toBe(urlLoader.name);
    expect(loader.load).toBe(urlLoader.load);
    expect(loader.test).toBe(urlLoader.test);
  });

  it('验证 getLoader by default', async () => {
    expect(compiler1.getLoader({}).name).toBe(urlLoader.name);
    expect(compiler2.getLoader({}).name).toBe(localLoader.name);
  });

  it('验证 getLoader by entry', async () => {
    expect(compiler1.getLoader({ entry: '/tmp/preset.json' }).name).toBe(
      localLoader.name,
    );

    expect(compiler1.getLoader({ entry: 'http://www.baidu.com' }).name).toBe(
      urlLoader.name,
    );

    expect(compiler1.getLoader({ entry: 'aaa' })).toBeUndefined();

    expect(compiler2.getLoader({ entry: '/tmp/preset.json' }).name).toBe(
      localLoader.name,
    );
  });

  it('验证 getLoader Options', async () => {
    const loadOptions = {
      a1: 'a.1',
      aa: {
        a11: 'a.1.1',
        a12: 'a.1.2',
        aaa: { a111: 'a.1.1', a11x: 'a.1.x1' },
      },
    };

    const loadOptions2 = {
      a2: 'a.2',
      aa: {
        a11: 'a.1.1',
        a13: 'a.1.3',
        aaa: { a111: 'a.1.1', a112: 'a.1.2', a11x: 'a.1.x2' },
      },
    };

    const loader = compiler1.getLoader({
      loadOptions,
    });

    expect(loader.loadOptions).not.toBe(loadOptions);
    expect(loader.loadOptions).toStrictEqual(loadOptions);

    const loader2 = compiler1.getLoader({
      loader: loader,
      loadOptions: loadOptions2,
    });

    expect(loader2.loadOptions).toStrictEqual({
      a1: 'a.1',
      a2: 'a.2',
      aa: {
        a11: 'a.1.1',
        a12: 'a.1.2',
        a13: 'a.1.3',
        aaa: {
          a111: 'a.1.1',
          a112: 'a.1.2',
          a11x: 'a.1.x2',
        },
      },
    });
  });
});

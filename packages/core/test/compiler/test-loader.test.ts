import * as testUtil from '../util';

import { Compiler } from '../../src';
import * as processors from '../../src/processors';

describe('compiler/loader：测试loader testLoader', () => {
  let compiler: Compiler;
  const urlLoader = processors.urlLoader();
  const localLoader = testUtil.localLoader();

  const jsonParser = processors.jsonParser();
  const yamlParser = testUtil.yamlParser();

  beforeAll(() => {
    compiler = testUtil.createDefaultCompiler({
      loaders: [urlLoader, localLoader],
      parsers: [jsonParser, yamlParser],
    });
  });

  it('验证 testLoader', async () => {
    expect(compiler.testLoader(urlLoader, '')).toBeTruthy();
    expect(compiler.testLoader(urlLoader, null)).toBeTruthy();
    expect(compiler.testLoader(urlLoader, undefined)).toBeTruthy();

    expect(compiler.testLoader(urlLoader, './')).toBeFalsy();
    expect(
      compiler.testLoader(urlLoader, 'http://www.example.com'),
    ).toBeTruthy();

    expect(compiler.testLoader(localLoader, '')).toBeTruthy();
    expect(compiler.testLoader(localLoader, null)).toBeTruthy();
    expect(compiler.testLoader(localLoader, undefined)).toBeTruthy();

    expect(compiler.testLoader(localLoader, './')).toBeFalsy();
    expect(compiler.testLoader(localLoader, '/a/b.json')).toBeTruthy();
    expect(compiler.testLoader(localLoader, 'c:/a/b.json')).toBeTruthy();
    expect(compiler.testLoader(localLoader, 'c://a/b.json')).toBeTruthy();
    expect(
      compiler.testLoader(localLoader, 'http://www.example.com'),
    ).toBeFalsy();

    expect(
      compiler.testLoader(localLoader, { entry: 'c://a/b.json' }),
    ).toBeTruthy();
  });

  it('验证 testLoader2', async () => {
    const urlLoader1 = processors.urlLoader();
    expect(
      compiler.testLoader(urlLoader1, 'ftp://www.example.com'),
    ).toBeFalsy();

    urlLoader1.test = '';
    expect(
      compiler.testLoader(urlLoader1, 'ftp://www.example.com'),
    ).toBeTruthy();

    urlLoader1.test = `^https://www.*.com`;
    expect(
      compiler.testLoader(urlLoader1, 'ftp://www.example.com'),
    ).toBeFalsy();

    expect(
      compiler.testLoader(urlLoader1, 'https://www.example.com'),
    ).toBeTruthy();

    urlLoader1.test = new RegExp(`^ftp://www.*.com`);
    expect(
      compiler.testLoader(urlLoader1, 'ftp://www.example.com'),
    ).toBeTruthy();

    const urlLoader2: any = processors.urlLoader();
    urlLoader2.test = {};
    expect(
      compiler.testLoader(urlLoader2, 'ftp://www.example.com'),
    ).toBeFalsy();
  });
});

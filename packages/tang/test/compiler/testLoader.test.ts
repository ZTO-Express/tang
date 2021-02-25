import { Compiler } from '../../src/compiler';

import * as loader from '../../src/loader';
import * as parser from '../../src/parser';

describe('compiler/loader：测试loader testLoader', () => {
  let compiler: Compiler;
  const urlLoader = loader.urlLoader();
  const localLoader = loader.localLoader();

  const jsonParser = parser.jsonParser();
  const yamlParser = parser.yamlParser();

  beforeAll(() => {
    compiler = new Compiler({
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
  });
});

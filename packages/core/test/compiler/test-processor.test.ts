import * as testUtil from '../util';

import { Compiler } from '../../src';
import * as processors from '../../src/processors';

describe('compiler/loader：测试loader testProcessor', () => {
  let compiler: Compiler;
  const urlLoader = processors.urlLoader();
  const docLoader = testUtil.docLoader();

  const jsonParser = processors.jsonParser();
  const yamlParser = testUtil.yamlParser();

  beforeAll(() => {
    compiler = testUtil.createDefaultCompiler({
      loaders: [urlLoader, docLoader],
      parsers: [jsonParser, yamlParser],
    });
  });

  it('验证 testProcessor', async () => {
    expect(compiler.testProcessor(urlLoader, { entry: '' })).toBeFalsy();
    expect(compiler.testProcessor(urlLoader, null)).toBeFalsy();
    expect(compiler.testProcessor(urlLoader, undefined)).toBeFalsy();

    expect(compiler.testProcessor(urlLoader, { entry: './' })).toBeFalsy();
    expect(
      compiler.testProcessor(urlLoader, { entry: 'http://www.example.com' }),
    ).toBeTruthy();

    expect(compiler.testProcessor(docLoader, { entry: '' })).toBeFalsy();
    expect(compiler.testProcessor(docLoader, null)).toBeFalsy();
    expect(compiler.testProcessor(docLoader, undefined)).toBeFalsy();

    expect(compiler.testProcessor(docLoader, { entry: './' })).toBeFalsy();
    expect(
      compiler.testProcessor(docLoader, { entry: '/a/b.json' }),
    ).toBeTruthy();
    expect(
      compiler.testProcessor(docLoader, { entry: 'c:/a/b.json' }),
    ).toBeTruthy();
    expect(
      compiler.testProcessor(docLoader, { entry: 'c://a/b.json' }),
    ).toBeTruthy();
    expect(
      compiler.testProcessor(docLoader, { entry: 'http://www.example.com' }),
    ).toBeTruthy();

    expect(
      compiler.testProcessor(docLoader, { entry: 'c://a/b.json' }),
    ).toBeTruthy();
  });

  it('验证 testProcessor2', async () => {
    const urlLoader1 = processors.urlLoader();
    expect(
      compiler.testProcessor(urlLoader1, { entry: 'ftp://www.example.com' }),
    ).toBeFalsy();

    urlLoader1.test = '';
    expect(
      compiler.testProcessor(urlLoader1, { entry: 'ftp://www.example.com' }),
    ).toBeTruthy();

    urlLoader1.test = `^https://www.*.com`;
    expect(
      compiler.testProcessor(urlLoader1, { entry: 'ftp://www.example.com' }),
    ).toBeFalsy();

    expect(
      compiler.testProcessor(urlLoader1, { entry: 'https://www.example.com' }),
    ).toBeTruthy();

    urlLoader1.test = new RegExp(`^ftp://www.*.com`);
    expect(
      compiler.testProcessor(urlLoader1, { entry: 'ftp://www.example.com' }),
    ).toBeTruthy();

    const urlLoader2: any = processors.urlLoader();
    urlLoader2.test = {};
    expect(
      compiler.testProcessor(urlLoader2, { entry: 'ftp://www.example.com' }),
    ).toBeFalsy();
  });
});

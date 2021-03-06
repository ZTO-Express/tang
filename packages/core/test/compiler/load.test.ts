import * as testUtil from '../util';
import { ErrorCodes } from '@tang/common';

import { Compiler } from '../../src';
import * as processors from '../../src/processors';

describe('compiler/load：load 加载', () => {
  const testTmpDir = testUtil.resolveTmpDir('localOutputer');

  const urlLoader = processors.urlLoader();
  const localLoader = testUtil.localLoader();

  const jsonParser = processors.jsonParser();
  const yamlParser = testUtil.yamlParser();

  let compiler1: Compiler;
  let compiler2: Compiler;

  const tfDocPath = testUtil.resolveFixturePath('openapi.yaml');

  beforeAll(() => {
    compiler1 = testUtil.createDefaultCompiler({
      loaders: [urlLoader, localLoader],
      parsers: [jsonParser, yamlParser],
    });

    compiler2 = testUtil.createDefaultCompiler({
      defaultParser: 'yaml',
      defaultGenerator: 'yaml',
      loaders: [urlLoader, localLoader],
      parsers: [jsonParser, yamlParser],
    });
  });

  it('验证 load by name', async () => {
    const compilation = await compiler1.load(tfDocPath, {
      parser: 'yaml',
    });
    expect(compilation.compiler).toBe(compiler1);
    expect(compilation.loader).not.toBe(localLoader);
    expect(compilation.loader).toStrictEqual(localLoader);

    await expect(
      compiler1.load(tfDocPath, { loader: 'NonExists' }),
    ).rejects.toMatchObject({
      message: '未找到加载器',
      code: ErrorCodes.LOADER_ERROR,
    });

    expect(compilation.parser).not.toBe(yamlParser);
    expect(compilation.parser).toStrictEqual(yamlParser);
    expect(compilation.document.entry).toBe(tfDocPath);
    expect(compilation.document.model.openapi).toBe('3.0.0');

    await expect(
      compiler1.load(tfDocPath, { parser: 'NonExists' }),
    ).rejects.toMatchObject({
      message: '未找到解析器',
      code: ErrorCodes.PARSER_ERROR,
    });
  });

  it('验证 load by default', async () => {
    const compilation = await compiler2.load(tfDocPath);

    expect(compilation.compiler).toBe(compiler2);
    expect(compilation.parser).not.toBe(yamlParser);
    expect(compilation.parser).toStrictEqual(yamlParser);

    expect(compilation.compiler).toBe(compiler2);
  });
});

import * as testUtil from '../util';

import { error } from '../../src/common';
import { Compiler } from '../../src/compiler';
import * as loader from '../../src/loader';
import * as parser from '../../src/parser';

describe('compiler/load：load 加载', () => {
  const testTmpDir = testUtil.resolveTmpDir('localOutputer');

  const urlLoader = loader.urlLoader();
  const localLoader = loader.localLoader();

  const jsonParser = parser.jsonParser();
  const yamlParser = parser.yamlParser();

  let compiler1: Compiler;
  let compiler2: Compiler;

  const tfDocPath = testUtil.resolveFixturePath(
    'documents/task-flow/openapi.yaml',
  );

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
      code: error.Errors.BAD_LOADER,
    });

    expect(compilation.parser).not.toBe(yamlParser);
    expect(compilation.parser).toStrictEqual(yamlParser);
    expect(compilation.document.entry).toBe(tfDocPath);
    expect(compilation.document.model.openapi).toBe('3.0.0');

    await expect(
      compiler1.load(tfDocPath, { parser: 'NonExists' }),
    ).rejects.toMatchObject({
      message: '未找到解析器',
      code: error.Errors.BAD_PARSER,
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

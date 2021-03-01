import * as testUtil from '../util';

import { error } from '../../src/common';
import { Compilation, Compiler } from '../../src/compiler';
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
  let yamlCompilation: Compilation;

  const tfDocPath = testUtil.resolveFixturePath(
    'documents/task-flow/openapi.yaml',
  );

  beforeAll(async () => {
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

    yamlCompilation = await compiler1.load(tfDocPath, {
      parser: 'yaml',
    });
  });

  it('验证 generate by name', async () => {
    const compilation = yamlCompilation;
    expect(compilation.parser).not.toBe(yamlParser);
    expect(compilation.parser).toStrictEqual(yamlParser);
    expect(compilation.document.entry).toBe(tfDocPath);
    expect(compilation.document.model.openapi).toBe('3.0.0');

    await expect(
      compiler1.generate(compilation.document, { generator: 'NonExists' }),
    ).rejects.toMatchObject({
      message: '未找到生成器',
      code: error.Errors.BAD_GENERATOR,
    });

    await expect(
      compiler1.generate(compilation.document, { outputer: 'NonExists' }),
    ).rejects.toMatchObject({
      message: '未找到输出器',
      code: error.Errors.BAD_OUTPUTER,
    });

    const generation = await compiler1.generate(compilation.document, {
      generator: 'yaml',
      outputer: 'memory',
    });

    expect(generation.files.length).toBe(1);

    const genFileBuffer = await generation.vol.promises.readFile(
      generation.files[0].path,
    );

    expect(genFileBuffer).toBeInstanceOf(Buffer);
    expect(genFileBuffer.toString()).toMatch('openapi: 3.0.0');
  });

  // it('验证 generate by default', async () => {
  //   const compilation = await compiler2.generate({
  //     model: { test: 'test' },
  //   });

  //   expect(compilation.compiler).toBe(compiler2);
  //   expect(compilation.parser).not.toBe(yamlParser);
  //   expect(compilation.parser).toStrictEqual(yamlParser);
  // });
});

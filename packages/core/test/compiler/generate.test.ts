import * as testUtil from '../util';
import { ErrorCodes } from '@tang/common';

import { Compilation, Compiler } from '../../src';
import * as processors from '../../src/processors';

describe('compiler/load：load 加载', () => {
  const testTmpDir = testUtil.resolveTmpDir('localOutputer');

  const urlLoader = processors.urlLoader();
  const docLoader = testUtil.docLoader();

  const jsonParser = processors.jsonParser();
  const yamlParser = testUtil.yamlParser();

  let compiler1: Compiler;
  let compiler2: Compiler;
  let yamlCompilation: Compilation;

  const tfDocPath = testUtil.resolveFixturePath('openapi.yaml');

  beforeAll(async () => {
    compiler1 = testUtil.createDefaultCompiler({
      loaders: [urlLoader, docLoader],
      parsers: [jsonParser, yamlParser],
    });

    compiler2 = testUtil.createDefaultCompiler({
      defaultParser: 'yaml',
      defaultGenerator: 'yaml',
      loaders: [urlLoader, docLoader],
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
      code: ErrorCodes.GENERATOR_ERROR,
    });

    await expect(
      compiler1.generate(compilation.document, { outputer: 'NonExists' }),
    ).rejects.toMatchObject({
      message: '未找到输出器',
      code: ErrorCodes.OUTPUTER_ERROR,
    });

    const output = await compiler1.generate(compilation.document, {
      generator: 'yaml',
      outputer: 'memory',
    });

    expect(output.files.length).toBe(1);

    const genFileBuffer = await output.vol.promises.readFile(
      output.files[0].path,
    );

    expect(genFileBuffer).toBeInstanceOf(Buffer);
    expect(genFileBuffer.toString()).toMatch('openapi: 3.0.0');
  });
});

import * as testUtil from '../util';

import { ErrorCodes } from '@devs-tang/common';
import { createCompiler, moduleLoader } from '../../src';
import { getNormalizedOptions } from '../../src/options/normalize-options';

describe('tang：tang工具配置', () => {
  const tfDocPath = testUtil.resolveFixturePath('mesh.js');

  it('tang compiler', async () => {
    const defaultOptions = getNormalizedOptions();

    const compiler = await createCompiler(defaultOptions);

    expect(compiler.loaders.length).toBe(1);
    expect(compiler.parsers.length).toBe(1);
    expect(compiler.generators.length).toBe(1);
    expect(compiler.outputers.length).toBe(1);

    expect(compiler.defaultLoader).toBe(compiler.loaders[0]);
    expect(compiler.defaultParser).toBe(compiler.parsers[0]);
    expect(compiler.defaultGenerator).toBe(compiler.generators[0]);
    expect(compiler.defaultOutputer).toBe(compiler.outputers[0]);

    expect(compiler.loaders).not.toBe(defaultOptions.loaders);
    expect(JSON.stringify(compiler.loaders)).toBe(
      JSON.stringify(defaultOptions.loaders),
    );
  });

  it('tang compiler load & generate', async () => {
    const normalizedOptions = getNormalizedOptions({
      loaders: [moduleLoader()],
    });

    const compiler = await createCompiler(normalizedOptions);

    const compilation = await compiler.load(tfDocPath, {
      parser: 'json',
    });

    expect(compilation.document.model.name).toBe('tang-test-mesh');

    await expect(
      compiler.generate(compilation.document, { generator: 'NonExists' }),
    ).rejects.toMatchObject({
      message: '未找到生成器',
      code: ErrorCodes.GENERATOR_ERROR,
    });

    await expect(
      compiler.generate(compilation.document, { outputer: 'NonExists' }),
    ).rejects.toMatchObject({
      message: '未找到输出器',
      code: ErrorCodes.OUTPUTER_ERROR,
    });

    // const output = await compiler.generate(compilation.document, {
    //   generator: 'yaml',
    //   outputer: 'memory',
    // });

    // expect(output.files.length).toBe(1);

    // const genFileBuffer = await output.vol.promises.readFile(
    //   output.files[0].path,
    // );

    // expect(genFileBuffer).toBeInstanceOf(Buffer);
    // expect(genFileBuffer.toString()).toMatch('openapi: 3.0.0');
  });
});

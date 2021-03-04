import * as testUtil from '../util';

import { error } from '../../src/common';
import { tang, loader } from '../../src';
import { getNormalizedOptions } from '../../src/options/normalize-options';

describe('tang：tang工具配置', () => {
  const tfDocPath = testUtil.resolveFixturePath(
    'documents/task-flow/openapi.yaml',
  );

  it('tang compiler', async () => {
    const defaultOptions = getNormalizedOptions({});

    const compiler = await tang({});

    expect(compiler.loaders.length).toBe(2);
    expect(compiler.parsers.length).toBe(2);
    expect(compiler.generators.length).toBe(2);
    expect(compiler.outputers.length).toBe(2);

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
    const compiler = await tang({});

    const compilation = await compiler.load(tfDocPath, { parser: 'yaml' });

    expect(compilation.document.model.openapi).toBe('3.0.0');

    await expect(
      compiler.generate(compilation.document, { generator: 'NonExists' }),
    ).rejects.toMatchObject({
      message: '未找到生成器',
      code: error.Errors.BAD_GENERATOR,
    });

    await expect(
      compiler.generate(compilation.document, { outputer: 'NonExists' }),
    ).rejects.toMatchObject({
      message: '未找到输出器',
      code: error.Errors.BAD_OUTPUTER,
    });

    const output = await compiler.generate(compilation.document, {
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

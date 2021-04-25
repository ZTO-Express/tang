import * as testUtil from '../util';
import { ErrorCodes } from '@devs-tang/common';
import { TangLauncher } from '../../src';
import { TANG_CONFIG_KEY_PRESETS } from '../../src/consts';

describe('tang/launch/generate：代码生成', () => {
  const tfDocPath = testUtil.resolveFixturePath('documents/preset.json');

  let launcher: TangLauncher;
  beforeEach(async () => {
    launcher = await TangLauncher.getInstance();
  });

  it('generate', async () => {
    // await expect(
    //   launcher.inspect(undefined, { entry: 'xxxx' }),
    // ).resolves.toBeUndefined();

    await expect(
      launcher.generate(tfDocPath, 'nonExists'),
    ).resolves.toBeUndefined();

    await expect(
      launcher.generate(tfDocPath, { generator: 'NonExists' }),
    ).rejects.toMatchObject({
      message: '未找到生成器',
      code: ErrorCodes.GENERATOR_ERROR,
    });

    await expect(
      launcher.generate(tfDocPath, { outputer: 'NonExists' }),
    ).rejects.toMatchObject({
      message: '未找到输出器',
      code: ErrorCodes.OUTPUTER_ERROR,
    });

    const compilation = await launcher.generate(tfDocPath, {
      generator: 'yaml',
      outputer: 'memory',
    });

    const output = compilation.output;

    expect(output.files.length).toBe(1);

    const genFileBuffer = await output.vol.promises.readFile(
      output.files[0].path,
    );

    expect(genFileBuffer).toBeInstanceOf(Buffer);
    expect(genFileBuffer.toString()).toMatch('name: ');
  });

  // 指定preset
  it('generate指定preset', async () => {
    const compilation = await launcher.generate('.', 'zf-gen:ts', {});
  });
});

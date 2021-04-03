import * as testUtil from '../util';
import { ErrorCodes } from '@devs-tang/common';
import { TangLauncher } from '../../src';
import { TANG_CONFIG_KEY_PRESETS } from '../../src/consts';

describe('tang/launch/generate：代码生成', () => {
  const tmpOutputDir = testUtil.resolveTmpDir();
  const tfDocPath = testUtil.resolveFixturePath('documents/preset.json');

  let launcher: TangLauncher;
  beforeEach(async () => {
    launcher = await TangLauncher.getInstance();
    launcher.configManager.unset(TANG_CONFIG_KEY_PRESETS);
  });

  it('generate', async () => {
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

    const output = await launcher.generate(tfDocPath, {
      generator: 'yaml',
      outputer: 'memory',
    });

    expect(output.files.length).toBe(1);

    const genFileBuffer = await output.vol.promises.readFile(
      output.files[0].path,
    );

    expect(genFileBuffer).toBeInstanceOf(Buffer);
    expect(genFileBuffer.toString()).toMatch('name: ');
  });
});

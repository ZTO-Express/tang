import * as testUtil from '../../util';
import { TangLauncher, PresetManager } from '../../../src';
import {
  TANG_CONFIG_KEY_PRESETS,
  TANG_PRESET_DEFAULT,
} from '../../../src/consts';

describe('tang/launch/presetManager：预设使用', () => {
  let presetManager: PresetManager;
  let launcher: TangLauncher;

  beforeAll(async () => {
    launcher = await TangLauncher.getInstance();
    presetManager = launcher.presetManager;

    launcher.configManager.unset(TANG_CONFIG_KEY_PRESETS);
  });

  it('应用预设 use', async () => {
    let preset = await presetManager.use();

    expect(preset.name).toBe(TANG_PRESET_DEFAULT);

    await expect(presetManager.use('notExists')).rejects.toThrow('未找到插件');

    preset = await presetManager.use(TANG_PRESET_DEFAULT, {
      outputer: 'memory',
    });

    await expect(presetManager.use('devkit:nonExists')).rejects.toThrow(
      '无效预设名称',
    );

    const inspectInfo = await launcher.inspect(TANG_PRESET_DEFAULT, {
      entry: 'nonExists',
    });

    expect(inspectInfo.outputer.name).toBe('memory');
  });

  it('use不存在的预设', async () => {
    const packagePath = testUtil.resolveFixturePath('git/cowsay');

    await launcher.pluginManager.add('cowsay', {
      package: packagePath,
      type: 'npm_link',
    });

    await expect(presetManager.use('cowsay:nonExists')).rejects.toThrow(
      '不包含预设',
    );

    await launcher.pluginManager.delete('cowsay');
  });
});

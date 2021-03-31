import * as testUtil from '../util';
import { TangLauncher, PresetManager } from '../../src';
import { TANG_CONFIG_KEY_PRESETS } from '../../src/consts';

describe('tang/plugin/install：安装插件', () => {
  let presetManager: PresetManager;

  beforeAll(async () => {
    const launcher = await TangLauncher.getInstance();
    launcher.configManager.unset(TANG_CONFIG_KEY_PRESETS);

    presetManager = launcher.presetManager;
  });

  it('初始化', async () => {
    const configs = presetManager.getAllConfigs();
    expect(configs).toEqual({
      tang: {},
    });
  });
});

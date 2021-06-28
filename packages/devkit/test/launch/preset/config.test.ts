import * as testUtil from '../../util';
import { TangLauncher, PresetManager } from '../../../src';
import {
  TANG_CONFIG_KEY_PRESETS,
  TANG_PRESET_DEFAULT,
} from '../../../src/consts';

describe('tang/launch/presetManager：预设配置管理', () => {
  let presetManager: PresetManager;
  let launcher: TangLauncher;

  beforeEach(async () => {
    launcher = await TangLauncher.getInstance();
    presetManager = launcher.presetManager;

    launcher.configManager.unset(TANG_CONFIG_KEY_PRESETS);
  });

  it('设置获取配置', async () => {
    expect(presetManager.getAllConfigNames()).toEqual([]);

    const configs = presetManager.getAllConfigs();
    expect(configs).toEqual({
      [TANG_PRESET_DEFAULT]: {},
    });

    presetManager.setConfig('test', 'loader', 'yaml');

    expect(presetManager.setConfig('', 'loader', 'yaml')).toBeUndefined();

    expect(presetManager.getConfig('test', 'loader')).toBe('yaml');

    expect(presetManager.unsetConfig('', 'loader')).toBeUndefined();

    expect(presetManager.getConfig('test', 'loader')).toBe('yaml');

    expect(presetManager.getConfig('testxxx')).toEqual({
      name: 'plugin:testxxx:~',
    });
  });

  it('设置正在使用的配置', async () => {
    presetManager.setUsedConfig('cowsayx');

    expect(presetManager.getUsedConfig()).toEqual({
      moduleType: 'plugin',
      name: 'plugin:cowsayx:~',
      processOptions: undefined,
      use: true,
    });

    presetManager.setUsedConfig(undefined);
    expect(presetManager.getUsedConfig()).toEqual({
      moduleType: 'plugin',
      name: 'plugin:cowsayx:~',
      processOptions: undefined,
      use: true,
    });

    presetManager.unsetUsedConfig();
    expect(presetManager.getUsedPluginName()).toBeUndefined();

    expect(presetManager.getConfigByName(undefined)).toBeUndefined();
  });
});

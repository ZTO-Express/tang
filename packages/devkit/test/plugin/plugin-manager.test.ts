import * as testUtil from '../util';
import { TangModuleTypes } from '@devs-tang/common';
import { TangLauncher, PluginManager } from '../../src';
import { TANG_CONFIG_KEY_PRESETS, TANG_PRESET_DEFAULT } from '../../src/consts';

describe('tang/plugin/pluginManager：插件管理', () => {
  let pluginManager: PluginManager;
  let launcher: TangLauncher;

  beforeEach(async () => {
    launcher = await TangLauncher.getInstance();
    pluginManager = launcher.pluginManager;

    launcher.configManager.unset(TANG_CONFIG_KEY_PRESETS);
  });

  it('解析插件名称 parsePluginName', async () => {
    expect(pluginManager.parsePluginName(undefined)).toBe(undefined);
    expect(pluginManager.parsePluginName({ name: '' })).toBe(undefined);

    expect(pluginManager.parsePluginName('tang-plugin-test')).toEqual({
      name: 'test',
      shortName: 'test',
      prefixName: 'tang-plugin-test',
      fullName: 'tang-plugin-test',
    });

    expect(pluginManager.parsePluginName('tang-plugin-test@0.1')).toEqual({
      name: 'test@0.1',
      shortName: 'test',
      prefixName: 'tang-plugin-test',
      fullName: 'tang-plugin-test@0.1',
      version: '0.1',
    });

    expect(pluginManager.parsePluginName('test@0.1')).toEqual({
      name: 'test@0.1',
      shortName: 'test',
      prefixName: 'tang-plugin-test',
      fullName: 'tang-plugin-test@0.1',
      version: '0.1',
    });
  });
});

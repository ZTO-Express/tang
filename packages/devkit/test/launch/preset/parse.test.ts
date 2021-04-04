import * as testUtil from '../../util';
import { TangModuleTypes } from '@devs-tang/common';
import { TangLauncher, PresetManager } from '../../../src';
import {
  TANG_CONFIG_KEY_PRESETS,
  TANG_PRESET_DEFAULT,
} from '../../../src/consts';

describe('tang/launch/presetManager：预设名称解析相关', () => {
  let presetManager: PresetManager;
  let launcher: TangLauncher;

  beforeEach(async () => {
    launcher = await TangLauncher.getInstance();
    presetManager = launcher.presetManager;
    launcher.configManager.unset(TANG_CONFIG_KEY_PRESETS);
  });

  it('解析预设名称 parsePresetName', async () => {
    expect(presetManager.parsePresetName(undefined)).toBe(undefined);

    expect(presetManager.parsePresetName('pluginName:')).toEqual({
      moduleType: TangModuleTypes.plugin,
      pluginName: 'pluginName',
      name: TANG_PRESET_DEFAULT,
      fullName: `${TangModuleTypes.plugin}:pluginName:${TANG_PRESET_DEFAULT}`,
    });

    expect(presetManager.parsePresetName(TANG_PRESET_DEFAULT)).toEqual({
      name: TANG_PRESET_DEFAULT,
      fullName: TANG_PRESET_DEFAULT,
      moduleType: TangModuleTypes.devkit,
    });

    expect(presetManager.parsePresetName('plugin:test')).toEqual({
      moduleType: TangModuleTypes.plugin,
      pluginName: 'test',
      name: TANG_PRESET_DEFAULT,
      fullName: `${TangModuleTypes.plugin}:test:${TANG_PRESET_DEFAULT}`,
    });

    expect(presetManager.parsePresetName('plugin:test:presetName')).toEqual({
      moduleType: TangModuleTypes.plugin,
      pluginName: 'test',
      name: 'presetName',
      fullName: `${TangModuleTypes.plugin}:test:${'presetName'}`,
    });

    expect(presetManager.parsePresetName('plugin:test:presetName:xxx')).toEqual(
      {
        moduleType: TangModuleTypes.plugin,
        pluginName: 'test',
        name: 'presetName',
        fullName: `${TangModuleTypes.plugin}:test:${'presetName'}`,
      },
    );

    expect(presetManager.parsePresetName('core:test')).toEqual({
      moduleType: TangModuleTypes.core,
      name: 'test',
      fullName: `${TangModuleTypes.core}:test`,
    });

    expect(presetManager.parsePresetName('pluginName:test')).toEqual({
      moduleType: TangModuleTypes.plugin,
      pluginName: 'pluginName',
      name: 'test',
      fullName: `${TangModuleTypes.plugin}:pluginName:test`,
    });

    expect(presetManager.parsePresetName('pluginName')).toEqual({
      moduleType: TangModuleTypes.plugin,
      pluginName: 'pluginName',
      name: TANG_PRESET_DEFAULT,
      fullName: `${TangModuleTypes.plugin}:pluginName:${TANG_PRESET_DEFAULT}`,
    });

    expect(() => presetManager.parsePresetName('plugin::test')).toThrow(
      '插件名称不能为空',
    );

    expect(() => presetManager.parsePresetName('xxx:plugin:xxx:')).toThrow(
      '无效预设名称',
    );
  });
});

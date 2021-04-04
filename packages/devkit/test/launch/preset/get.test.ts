import * as testUtil from '../../util';
import { TangLauncher, PresetManager } from '../../../src';
import { TANG_CONFIG_KEY_PRESETS } from '../../../src/consts';

describe('tang/launch/presetManager：预设获取', () => {
  let presetManager: PresetManager;
  let launcher: TangLauncher;

  beforeEach(async () => {
    launcher = await TangLauncher.getInstance();
    presetManager = launcher.presetManager;

    launcher.configManager.unset(TANG_CONFIG_KEY_PRESETS);
  });

  it('获取默认预设', async () => {
    const presetWithConfig = presetManager.normalizePresetWithConfig(
      {
        name: 'test-preset',
        presetOptions: {
          mergeDefaultPreset: false,
        },
      },
      {
        name: 'plugin:tang-test:order',
      },
    );

    expect(presetWithConfig).toEqual({
      name: 'plugin:tang-test:order',
      preset: {
        name: 'test-preset',
      },
      presetOptions: {
        mergeDefaultPreset: false,
      },
    });
  });

  // it('获取正在使用的预设 getUsedPresetWithConfig', async () => {
  //   const preset = await presetManager.getUsedPresetWithConfig();
  // });

  it('通过名称获取预设 getPresetWithConfigByName', async () => {
    let presetWithConfig = await presetManager.getPresetWithConfigByName(
      undefined,
    );
    expect(presetWithConfig).toBeUndefined();

    presetWithConfig = await presetManager.getPresetWithConfigByName(
      'nonExists',
    );
    expect(presetWithConfig).toBeUndefined();
  });
});

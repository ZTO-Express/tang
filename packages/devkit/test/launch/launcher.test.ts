import * as testUtil from '../util';
import { TangLauncher, utils } from '../../src';
import {
  TANG_CONFIG_KEY_PRESETS,
  TANG_CONFIG_KEY_PRESET_DEFAULT,
} from '../../src/consts';

describe('tang/launcher：启动器', () => {
  let launcher: TangLauncher;

  beforeAll(async () => {
    launcher = await TangLauncher.getInstance();
    launcher.configManager.unset(TANG_CONFIG_KEY_PRESETS);
  });

  it('install', async () => {
    await launcher.pluginManager.add('cowsay');
  });

  it('use', async () => {
    // await launcher.presetManager.use('cowsay');

    await launcher.presetManager.use('tang');
  });

  it('inspect', async () => {
    const inspectData = await launcher.inspect(TANG_CONFIG_KEY_PRESET_DEFAULT, {
      entry: 'test.xxxx',
    });
    expect(inspectData.name).toBe(TANG_CONFIG_KEY_PRESET_DEFAULT);
    expect(inspectData.processOptions).toEqual({});

    const docUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.v1.json',
    );
    const inspectData2 = await launcher.inspect(
      TANG_CONFIG_KEY_PRESET_DEFAULT,
      {
        entry: docUrl,
      },
    );
  });

  it('getPresetWithConfigOptions', async () => {
    const presetOptions = await launcher.getPresetWithConfigOptions(undefined);
    const preset = presetOptions.preset;

    expect(preset.name).toBe(TANG_CONFIG_KEY_PRESET_DEFAULT);

    expect(preset.loaders[0].name).toBe('doc');
    expect(utils.arryLast(preset.loaders).name).toBe('url');

    expect(preset.parsers[0].name).toBe('json5');
    expect(utils.arryLast(preset.parsers).name).toBe('json');
  });

  it('getPresetWithConfigOptions tang', async () => {
    const presetOptions = await launcher.getPresetWithConfigOptions(
      TANG_CONFIG_KEY_PRESET_DEFAULT,
    );
    const preset = presetOptions.preset;

    expect(preset.name).toBe(TANG_CONFIG_KEY_PRESET_DEFAULT);

    expect(preset.loaders[0].name).toBe('doc');
    expect(utils.arryLast(preset.loaders).name).toBe('url');

    expect(preset.parsers[0].name).toBe('json5');
    expect(utils.arryLast(preset.parsers).name).toBe('json');
  });
});

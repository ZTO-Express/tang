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

  it('getPresetOptions', async () => {
    const presetOptions = await launcher.getPresetOptions();
    expect(presetOptions.name).toBe(TANG_CONFIG_KEY_PRESET_DEFAULT);

    expect(presetOptions.loaders[0].name).toBe('doc');
    expect(utils.arryLast(presetOptions.loaders).name).toBe('url');

    expect(presetOptions.parsers[0].name).toBe('json5');
    expect(utils.arryLast(presetOptions.parsers).name).toBe('json');
  });
});

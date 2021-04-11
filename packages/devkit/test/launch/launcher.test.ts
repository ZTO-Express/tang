import * as testUtil from '../util';
import { TangLauncher, utils, getLauncher } from '../../src';
import { TANG_CONFIG_KEY_PRESETS, TANG_PRESET_DEFAULT } from '../../src/consts';

describe('tang/launcher：启动器', () => {
  let launcher: TangLauncher;

  beforeEach(async () => {
    launcher = await getLauncher();
    launcher.configManager.unset(TANG_CONFIG_KEY_PRESETS);
  });

  it('plugin 操作', async () => {
    const result = await launcher.install('cowsay', {
      registry: 'https://registry.npm.taobao.org/',
    });
    expect(result.name).toBe('cowsay');

    let plugin = await launcher.getPlugin('cowsay');
    expect(plugin.name).toBe('cowsay');

    let preset = await launcher.use(TANG_PRESET_DEFAULT);
    expect(preset).toMatchObject({
      name: TANG_PRESET_DEFAULT,
      use: true,
    });

    plugin = await launcher.getPlugin();

    expect(plugin).toBeUndefined();

    preset = await launcher.use('cowsay');
    expect(preset).toMatchObject({
      moduleType: 'plugin',
      name: 'plugin:cowsay:~',
      use: true,
    });

    let isDeleted = await launcher.delete('cowsay');
    expect(isDeleted).toBe(true);

    plugin = await launcher.getPlugin('cowsay');
    expect(plugin).toBeUndefined();

    isDeleted = await launcher.delete('');
    expect(isDeleted).toBe(undefined);

    isDeleted = await launcher.delete('nonExists');
    expect(isDeleted).toBe(undefined);
  });

  it('插件卸载特殊情况处理', async () => {
    launcher.presetManager.setConfig('cowsay', 'use', true);
    await launcher.presetManager.saveConfig();
    expect(launcher.presetManager.getConfig('cowsay')).not.toBeUndefined();

    await launcher.delete('cowsay');
    expect(launcher.presetManager.getConfig('cowsay')).toBeUndefined();
  });

  it('inspect', async () => {
    const nonExistsData = await launcher.inspect('nonExists', {
      entry: 'test.xxxx',
    });
    expect(nonExistsData).toBeUndefined();

    const inspectData = await launcher.inspect(TANG_PRESET_DEFAULT, {
      entry: 'test.xxxx',
    });
    expect(inspectData.name).toBe(TANG_PRESET_DEFAULT);
    expect(inspectData.processOptions).toEqual({
      entry: 'test.xxxx',
    });

    const docUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.v1.json',
    );

    const inspectData2 = await launcher.inspect(TANG_PRESET_DEFAULT, {
      entry: docUrl,
    });

    expect(inspectData2.name).toBe(TANG_PRESET_DEFAULT);
    expect(inspectData2.loader.code).toBe('devkit:loader:doc');
    expect(inspectData2.parser.code).toBe('devkit:parser:json5');
    expect(inspectData2.generator.code).toBe('devkit:generator:yaml');
    expect(inspectData2.outputer.code).toBe('devkit:outputer:local');
  });

  it('getPresetWithConfigOptions', async () => {
    let presetOptions = await launcher.getPresetWithConfigOptions(undefined);
    const preset = presetOptions.preset;

    expect(preset.name).toBe(TANG_PRESET_DEFAULT);

    expect(preset.loaders[0].name).toBe('doc');
    expect(utils.arryLast(preset.loaders).name).toBe('url');

    expect(preset.parsers[0].name).toBe('json5');
    expect(utils.arryLast(preset.parsers).name).toBe('json');

    presetOptions = await launcher.getPresetWithConfigOptions('notExists');
    expect(presetOptions).toBeUndefined();
  });

  it('getPresetWithConfigOptions tang', async () => {
    const presetOptions = await launcher.getPresetWithConfigOptions(
      TANG_PRESET_DEFAULT,
    );
    const preset = presetOptions.preset;

    expect(preset.name).toBe(TANG_PRESET_DEFAULT);

    expect(preset.loaders[0].name).toBe('doc');
    expect(utils.arryLast(preset.loaders).name).toBe('url');

    expect(preset.parsers[0].name).toBe('json5');
    expect(utils.arryLast(preset.parsers).name).toBe('json');
  });
});

import { PluginManager, TangLauncher } from '../../src';

describe('tang/plugin/parsePluginName：解析插件名称', () => {
  let pm: PluginManager;

  beforeAll(async () => {
    const launcher = await TangLauncher.getInstance();
    pm = launcher.pluginManager;
  });

  it('解析插件名称', async () => {
    expect(pm.parsePluginName('tang-plugin-test')).toEqual({
      name: 'test',
      shortName: 'test',
      prefixName: 'tang-plugin-test',
      fullName: 'tang-plugin-test',
    });

    expect(pm.parsePluginName('tang-plugin-test', '0.1')).toEqual({
      name: 'test@0.1',
      shortName: 'test',
      prefixName: 'tang-plugin-test',
      fullName: 'tang-plugin-test@0.1',
      version: '0.1',
    });

    expect(pm.parsePluginName('test', '0.1')).toEqual({
      name: 'test@0.1',
      shortName: 'test',
      prefixName: 'tang-plugin-test',
      fullName: 'tang-plugin-test@0.1',
      version: '0.1',
    });

    expect(pm.parsePluginName('tang', '0.1')).toEqual({
      name: 'tang@0.1',
      shortName: 'tang',
      prefixName: 'tang-plugin-tang',
      fullName: 'tang-plugin-tang@0.1',
      version: '0.1',
    });
  });
});

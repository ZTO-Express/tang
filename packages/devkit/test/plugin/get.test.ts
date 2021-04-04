import { PluginManager, TangLauncher, fs } from '../../src';

describe('tang/plugin/get：插件信息获取相关方法', () => {
  let pm: PluginManager;

  beforeAll(async () => {
    const launcher = await TangLauncher.getInstance();
    pm = launcher.pluginManager;
  });

  it('通过名称获取插件 getByName', async () => {
    const badPluginName = 'bad-plugin';
    const badPluginDir = fs.joinPath(pm.pluginDir, badPluginName);
    const badPluginPath = fs.joinPath(badPluginDir, 'index.js');

    await fs.ensureDir(badPluginDir);
    await fs.emptyDir(badPluginDir);

    let plugin = await pm.getByName(badPluginName);
    expect(plugin).toBeUndefined();

    plugin = await pm.getByName('nonExists');
    expect(plugin).toBeUndefined();

    // 模块不存在直接删除
    const existsDir = await fs.pathExists(badPluginDir);
    expect(existsDir).toBe(false);

    await fs.ensureDir(badPluginDir);
    await fs.writeFile(badPluginPath, `module.exports = { test: true };`);
    plugin = await pm.getByName(badPluginName);
    expect(plugin).toEqual({
      name: 'bad-plugin',
      test: true,
    });

    await fs.ensureDir(badPluginDir);
    await fs.writeFile(badPluginPath, `bad Expression`);

    await expect(pm.getByName(badPluginName)).rejects.toThrow(
      'Unexpected identifier',
    );

    await fs.emptyDir(badPluginDir);
    await fs.rmdir(badPluginDir);
  });

  it('通过名称获取插件预设 getPresetFromPlugin', async () => {
    expect(
      pm.getPresetFromPlugin(
        {
          name: 'test-plugin',
          presets: [{ name: 'test1' }, { name: 'test2' }],
        },
        'test2',
      ),
    ).toEqual({ name: 'test2', pluginName: 'test-plugin' });

    expect(
      pm.getPresetFromPlugin({
        name: 'test-plugin',
        presets: [{ name: 'test1' }, { name: 'test2' }],
      }),
    ).toEqual({ name: 'test1', pluginName: 'test-plugin' });

    expect(pm.getPresetFromPlugin({ name: 'test-plugin' })).toBeUndefined();
  });

  it('获取插件元数据 retrievePluginMetadata', async () => {
    await expect(pm.retrievePluginMetadata(undefined)).resolves.toBe(undefined);

    await expect(pm.retrievePluginMetadata('test_data')).resolves.toBe(
      'test_data',
    );

    await expect(
      pm.retrievePluginMetadata({ name: 'default' }),
    ).resolves.toEqual({ name: 'default' });

    await expect(
      pm.retrievePluginMetadata({ metadata: { name: 'default' } }),
    ).resolves.toEqual({ name: 'default' });

    await expect(
      pm.retrievePluginMetadata(() => {
        return { name: 'default' };
      }),
    ).resolves.toEqual({ name: 'default' });

    await expect(
      pm.retrievePluginMetadata(() => Promise.resolve({ name: 'default' })),
    ).resolves.toEqual({ name: 'default' });
  });

  it('解析插件名称 parsePluginName', async () => {
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

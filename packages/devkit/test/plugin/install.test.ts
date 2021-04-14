import * as testUtil from '../util';
import {
  PluginManager,
  PluginNpmLinkInstallOptions,
  TangLauncher,
  fs,
} from '../../src';

import { TANG_PRESET_DEFAULT } from '../../src/consts';

describe('tang/plugin/install：安装插件', () => {
  let launcher: TangLauncher;
  let pluginManager: PluginManager;

  beforeAll(async () => {
    await testUtil.cleanTangLauncherTestEnv();

    launcher = await TangLauncher.getInstance();
    pluginManager = launcher.pluginManager;
  });

  it('列出所有插件', async () => {
    const list = await pluginManager.list();
    expect(list).toEqual([]);
  });

  it('从npm安装插件', async () => {
    const installedPlugin = await pluginManager.add('cowsay', {
      force: true,
      registry: 'https://registry.npm.taobao.org/',
      extArgs: '--no-save',
    });

    expect(installedPlugin).not.toBeUndefined();

    let list = await pluginManager.list('cowsay');
    expect(list).toEqual(['cowsay']);

    let exists = await pluginManager.exists('cowsay');
    expect(exists).toBe(true);

    exists = await pluginManager.exists('cowsay1');
    expect(exists).toBe(false);

    exists = await pluginManager.exists('cowsay', 'latest');
    expect(exists).toBe(false);

    exists = await pluginManager.exists('cowsay@latest');
    expect(exists).toBe(false);

    exists = await pluginManager.exists('cowsay1@latest');
    expect(exists).toBe(false);

    const result = await pluginManager.run('cowsay', 'say', { text: 'hello' });
    expect(result).toContain('hello');

    await expect(() => {
      return pluginManager.run('cowsay', 'name');
    }).rejects.toThrow('无效插件方法cowsay.name');

    await expect(() => {
      return pluginManager.run('cowsay', 'name1');
    }).rejects.toThrow('未找到插件方法cowsay.name1');

    // 重复安装直接返回
    const plugin = await pluginManager.add('cowsay');

    expect(plugin.name).toBe('cowsay');

    // 删除空值
    await expect(pluginManager.delete(undefined)).resolves.toBeUndefined();

    await pluginManager.delete('cowsay');

    list = await pluginManager.list('cowsay');
    expect(list).toEqual([]);

    const installedPlugin2 = await pluginManager.add('cowsay', {
      extArgs: '--no-save',
    });
    expect(installedPlugin2).not.toBeUndefined();
    await pluginManager.delete('cowsay');

    list = await pluginManager.list('cowsay');
    expect(list).toEqual([]);
  });

  it('本地安装插件（包含preset）', async () => {
    const packagePath = testUtil.resolveFixturePath('plugins/test');

    const plugin = await pluginManager.add(packagePath, {
      force: true,
      registry: 'https://registry.npm.taobao.org/',
    });

    expect(plugin).not.toBeUndefined();

    expect(plugin.packageInfo.name).toBe('test-tang');
    expect(plugin.packageInfo.version).not.toBeUndefined();
    expect(plugin.packageInfo.description).not.toBeUndefined();
    expect(plugin.packageInfo.author).not.toBeUndefined();

    let preset = await pluginManager.getPreset('test-tang');
    expect(preset).toEqual(plugin.preset);

    preset = await pluginManager.getPreset('test-tang', TANG_PRESET_DEFAULT);
    expect(preset).toEqual(plugin.preset);

    const orderPreset = await pluginManager.getPreset('test-tang', 'order');
    expect(orderPreset).toEqual(plugin.presets.find(it => it.name === 'order'));

    await pluginManager.delete('test-tang');
    const list1 = await pluginManager.list('test-tang');
    expect(list1).toEqual([]);

    // 默认安装
    const plugin2 = await pluginManager.add(packagePath);
    expect(plugin2).not.toBeUndefined();
    await pluginManager.delete('test-tang');
    const list2 = await pluginManager.list('test-tang');
    expect(list2).toEqual([]);
  });

  it('从npm link安装插件', async () => {
    const packagePath = testUtil.resolveFixturePath('git/cowsay');
    const installOptions = {
      version: '1.4.0',
      package: packagePath,
      force: true,
      type: 'npm_link',
    } as PluginNpmLinkInstallOptions;

    const plugin = await pluginManager.add('cowsay', installOptions);
    expect(plugin).toMatchObject({
      name: `cowsay@${installOptions.version}`,
      version: installOptions.version,
    });

    const pluginName = `cowsay@${installOptions.version}`;

    let pluginNames = await pluginManager.listByName(pluginName);
    expect(pluginNames[0]).toBe(pluginName);

    pluginNames = await pluginManager.listByName('cowsay');
    expect(pluginNames[0]).toBe(pluginName);

    pluginNames = await pluginManager.listByName();
    expect(pluginNames[0]).toBe(pluginName);

    const list = await pluginManager.list('cowsay');
    expect(list).toEqual([pluginName]);

    const result = await pluginManager.run(pluginName, 'say', {
      text: 'hello',
    });
    expect(result).toContain('hello');

    const result1 = await pluginManager.run(pluginName, 'think', {
      text: 'hello1',
    });
    expect(result1).toContain('hello1');

    await expect(pluginManager.run('nonExists', 'actionName')).rejects.toThrow(
      '未找到插件',
    );

    await pluginManager.deleteAll(pluginName);

    const list1 = await pluginManager.list('cowsay');
    expect(list1).toEqual([]);
  });

  it('暂不支持从脚本安装插件', async () => {
    const packagePath = testUtil.resolveFixturePath('plugins/test');

    await expect(
      pluginManager.add(packagePath, {
        force: true,
        type: 'shell' as any,
      }),
    ).rejects.toThrow('不支持');
  });

  it('安装/清理无效插件', async () => {
    const badPluginName = 'bad-plugin';
    const badPluginDir = fs.joinPath(pluginManager.pluginDir, badPluginName);
    const pluginTmpDir = pluginManager.pluginTmpDir;

    fs.ensureDirSync(badPluginDir);
    await expect(pluginManager.add(badPluginDir)).resolves.toBeUndefined();

    await expect(pluginManager.deleteAll(undefined)).rejects.toThrow(
      '请提供插件名称',
    );

    fs.ensureDirSync(badPluginDir);
    fs.ensureDirSync(pluginTmpDir);

    expect(fs.pathExistsSync(badPluginDir)).toBe(true);
    expect(fs.pathExistsSync(pluginTmpDir)).toBe(true);

    await pluginManager.prune();

    expect(fs.pathExistsSync(badPluginDir)).toBe(false);
    expect(fs.pathExistsSync(pluginTmpDir)).toBe(false);

    fs.emptyDirSync(pluginManager.pluginDir);
    fs.rmdirSync(pluginManager.pluginDir);
    await expect(pluginManager.getPluginNames()).resolves.toEqual([]);
  });
});

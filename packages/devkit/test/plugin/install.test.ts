import * as testUtil from '../util';
import {
  PluginManager,
  PluginNpmLinkInstallOptions,
  TangLauncher,
} from '../../src';

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
    await pluginManager.add('cowsay', {
      force: true,
    });

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

    expect(result).toContain('hello');
    await expect(() => {
      return pluginManager.run('cowsay', 'name');
    }).rejects.toThrow('无效插件方法cowsay.name');

    await expect(() => {
      return pluginManager.run('cowsay', 'name1');
    }).rejects.toThrow('未找到插件方法cowsay.name1');

    await pluginManager.delete('cowsay');

    list = await pluginManager.list('cowsay');
    expect(list).toEqual([]);
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

    await pluginManager.delete(pluginName, installOptions.version);

    const list1 = await pluginManager.list('cowsay');
    expect(list1).toEqual([]);
  });

  it('从shell Install安装插件', async () => {
    const packagePath = testUtil.resolveFixturePath('plugins/test');

    await expect(
      pluginManager.add(packagePath, {
        force: true,
        type: 'shell',
      }),
    ).rejects.toThrow('Not Implemented');

    await expect(
      pluginManager.add(packagePath, {
        force: true,
        type: 'notExists' as any,
      }),
    ).rejects.toThrow('不支持');
  });

  it('安装插件（包含preset）', async () => {
    const packagePath = testUtil.resolveFixturePath('plugins/test');

    const plugin = await pluginManager.add(packagePath, {
      force: true,
    });

    expect(plugin).not.toBeUndefined();

    await pluginManager.delete('test-tang');
    const list1 = await pluginManager.list('test-tang');
    expect(list1).toEqual([]);
  });
});

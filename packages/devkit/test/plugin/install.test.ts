import * as testUtil from '../util';
import { PluginManager, TangLauncher } from '../../src';

describe('tang/plugin/install：安装插件', () => {
  let pluginManager: PluginManager;

  beforeAll(async () => {
    const launcher = await TangLauncher.getInstance();
    pluginManager = launcher.pluginManager;
  });

  beforeEach(async () => {
    await testUtil.cleanTangLauncherTestEnv();
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
    expect(list).toEqual(['cowsay@latest']);

    let exists = await pluginManager.exists('cowsay');
    expect(exists).toBe(true);

    exists = await pluginManager.exists('cowsay1');
    expect(exists).toBe(false);

    exists = await pluginManager.exists('cowsay', 'latest');
    expect(exists).toBe(true);

    exists = await pluginManager.exists('cowsay@latest');
    expect(exists).toBe(true);

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

    await pluginManager.delete('cowsay@latest');

    list = await pluginManager.list('cowsay');
    expect(list).toEqual([]);
  });

  it('从npm link安装插件', async () => {
    const packagePath = testUtil.resolveFixturePath('git/cowsay');
    const installOptions = {
      version: '1.4.0',
      package: packagePath,
      force: true,
    };

    await pluginManager.add('cowsay', installOptions);

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

    await pluginManager.delete('cowsay', installOptions.version);

    const list1 = await pluginManager.list('cowsay');
    expect(list1).toEqual([]);
  });

  it('安装插件（包含preset）', async () => {
    const packagePath = testUtil.resolveFixturePath('plugins/test');

    await pluginManager.add('test-tang@0.0.1', {
      force: true,
      package: packagePath,
    });
  });
});

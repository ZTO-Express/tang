import * as testUtil from '../util';
import { TANG_HOME, TANG_CONFIG_FILENAME } from '../../src/consts';
import { ConfigManager, getDefaultConfig } from '../../src/config';

describe('tang/cli/config.manager load：配置加载', () => {
  //保存初始cwd
  const origCwd = process.cwd;

  const tmpDir = testUtil.resolveTmpDir();

  beforeEach(async () => {
    await testUtil.fs.ensureDir(tmpDir);
    await testUtil.fs.emptyDir(tmpDir);

    process.cwd = () => __dirname;
  });

  afterEach(() => {
    process.cwd = origCwd;
  });

  it('加载默认配置', async () => {
    const cfgManager = new ConfigManager({});
    await cfgManager.load();

    expect(cfgManager.config.configDir).toBe(TANG_HOME);
    expect(cfgManager.isWorkspace).toBe(false);
    expect(cfgManager.configPath).toBeUndefined();
    expect(cfgManager.workspaceRootDir).toBeUndefined();
  });

  it('从本地目录加载文件', async () => {
    const localPath = testUtil.fs.joinPath(__dirname, TANG_CONFIG_FILENAME);
    const parentPath = testUtil.fs.joinPath(
      __dirname,
      '..',
      TANG_CONFIG_FILENAME,
    );

    await testUtil.fs.writeJSON(localPath, {
      test: 'test1',
    });

    let cfgManager = new ConfigManager();
    await cfgManager.load();
    expect(cfgManager.get('test')).toBe('test1');
    expect(cfgManager.getUpdatedConfig()).toEqual({ test: 'test1' });

    await testUtil.fs.writeJSON(parentPath, { test: 'test2' });

    cfgManager = new ConfigManager();
    await cfgManager.load();
    expect(cfgManager.get('test')).toBe('test1');
    expect(cfgManager.getUpdatedConfig()).toEqual({ test: 'test1' });

    await testUtil.fs.remove(localPath);
    cfgManager = new ConfigManager();
    await cfgManager.load();
    expect(cfgManager.get('test')).toBe('test2');
    expect(cfgManager.getUpdatedConfig()).toEqual({ test: 'test2' });

    await testUtil.fs.remove(parentPath);

    // const testPath = testUtil.fs.joinPath(__dirname, '..', 'test.json');
    // await testUtil.fs.writeJSON(testPath, { test: 'test3' });

    // cfgManager = new ConfigManager();
    // await cfgManager.load('test.json');
    // expect(cfgManager.get('test')).toBe('test3');
    // expect(cfgManager.configDir).toBe(path.dirname(testPath));
    // expect(cfgManager.getUpdatedConfig()).toEqual({ test: 'test3' });

    // await testUtil.fs.remove(testPath);
    // cfgManager = new ConfigManager();
    // await cfgManager.load();
    // expect(cfgManager.configDir).toBe(TANG_HOME);
  });

  it('获取配置', async () => {
    const localPath = testUtil.fs.joinPath(__dirname, TANG_CONFIG_FILENAME);
    await testUtil.fs.writeJSON(localPath, {
      options: {
        devkit: {
          isTest: true,
        },
      },
      test: {
        name: 'devkit',
      },
    });

    const cfgManager = new ConfigManager();
    await cfgManager.load();

    expect(cfgManager.get<string>('test.name')).toBe('devkit');
    expect(cfgManager.get<string>('test.none')).toBeUndefined();
    expect(cfgManager.get<string>('test.none', 'devkit')).toBe('devkit');

    expect(cfgManager.getOptions('devkit')).toEqual({
      isTest: true,
    });

    expect(cfgManager.getOptions<boolean>('devkit.isTest')).toBe(true);
    expect(cfgManager.getOptions<boolean>('devkit.none')).toBeUndefined();
    expect(cfgManager.getOptions<boolean>('devkit.none', true)).toBe(true);
    expect(cfgManager.getOptions('')).toEqual(cfgManager.get('options'));
    expect(cfgManager.getOptions('.')).toEqual(cfgManager.get('options'));

    await testUtil.fs.remove(localPath);
  });

  it('修改配置', async () => {
    const localPath = testUtil.fs.joinPath(__dirname, TANG_CONFIG_FILENAME);
    await testUtil.fs.ensureFile(localPath);

    const cfgManager = new ConfigManager();

    const config = await cfgManager.load();
    expect(config).toEqual({
      configDir: __dirname,
      ...getDefaultConfig(),
    });

    cfgManager.set('test.name', 'devKit');
    expect(cfgManager.get('test.name')).toBe('devKit');
    expect(cfgManager.get('test')).toEqual({ name: 'devKit' });
    expect(config.test).toEqual({ name: 'devKit' });

    expect(cfgManager.get('.')).toEqual({
      configDir: __dirname,
      ...getDefaultConfig(),
      test: {
        name: 'devKit',
      },
    });

    expect(cfgManager.getUpdatedConfig()).toEqual({
      test: {
        name: 'devKit',
      },
    });

    cfgManager.set('test', 'devKit');
    expect(config.test).toBe('devKit');
    expect(cfgManager.getUpdatedConfig()).toEqual({ test: 'devKit' });

    cfgManager.unset('test');
    expect(config.test).toBeUndefined();
    expect(cfgManager.getUpdatedConfig()).toEqual({});

    await testUtil.fs.remove(localPath);
  });

  it('保存配置', async () => {
    const localPath = testUtil.fs.joinPath(__dirname, TANG_CONFIG_FILENAME);
    await testUtil.fs.writeJSON(localPath, {});

    const cfgManager = new ConfigManager();

    const config = await cfgManager.load();

    config.textOptions = { isTest: true };
    await cfgManager.save();

    expect(cfgManager.config.textOptions).toEqual({ isTest: true });
    expect(cfgManager.config.configDir).toBe(__dirname);

    const config2 = await cfgManager.load();
    expect(config2.textOptions).toEqual({ isTest: true });
    expect(cfgManager.getUpdatedConfig()).toEqual({
      textOptions: { isTest: true },
    });

    await testUtil.fs.writeFile(localPath, 'test_error');
    await expect(() => cfgManager.load()).rejects.toThrow('配置文件格式错误。');

    await testUtil.fs.remove(localPath);
  });
});

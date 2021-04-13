import * as path from 'path';
import * as testUtil from '../util';
import { TANG_HOME, TANG_CONFIG_FILENAME } from '../../src/consts';
import { ConfigManager, defaultConfig } from '../../src/config';

describe('tang/cli/config.manager load：配置加载', () => {
  const tmpDir = testUtil.resolveTmpDir();

  beforeEach(async () => {
    await testUtil.fs.ensureDir(tmpDir);
    await testUtil.fs.emptyDir(tmpDir);
  });

  it('加载默认配置', async () => {
    const cfgManager = new ConfigManager({});
    await cfgManager.load();

    expect(cfgManager.configDir).toBe(TANG_HOME);
    expect(cfgManager.configFileName).toBe(TANG_CONFIG_FILENAME);

    expect(cfgManager.configFilePath).toBe(
      path.join(TANG_HOME, TANG_CONFIG_FILENAME),
    );
  });

  it('加载临时配置', async () => {
    const cfgManager = new ConfigManager({ configDir: tmpDir });

    const config = await cfgManager.load();
    expect(config).toEqual(defaultConfig);

    config.textOptions = { isTest: true };
    await cfgManager.save();

    expect(cfgManager.config.textOptions).toEqual({ isTest: true });
    expect(cfgManager.configFilePath).toBe(`${tmpDir}/tang.json`);

    const config2 = await cfgManager.load();
    expect(config2.textOptions).toEqual({ isTest: true });

    await testUtil.fs.writeFile(cfgManager.configFilePath, 'test_error');

    await expect(() => cfgManager.load()).rejects.toThrow('配置文件格式错误。');

    await testUtil.fs.emptyDir(tmpDir);
  });

  it('修改配置', async () => {
    const cfgManager = new ConfigManager({ configDir: tmpDir });

    const config = await cfgManager.load();
    expect(config).toEqual(defaultConfig);

    cfgManager.set('test.name', 'devKit');
    expect(cfgManager.get('test.name')).toBe('devKit');
    expect(cfgManager.get('test')).toEqual({ name: 'devKit' });
    expect(config.test).toEqual({ name: 'devKit' });

    expect(cfgManager.get('.')).toEqual({
      ...defaultConfig,
      test: {
        name: 'devKit',
      },
    });

    cfgManager.set('test', 'devKit');
    expect(config.test).toBe('devKit');

    cfgManager.unset('test');
    expect(config.test).toBeUndefined();
  });

  it('从本地目录加载文件', async () => {
    const origCwd = process.cwd;
    process.cwd = () => __dirname;

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
    expect(cfgManager.configDir).toBe(path.dirname(localPath));

    await testUtil.fs.writeJSON(parentPath, {
      test: 'test2',
    });

    cfgManager = new ConfigManager();
    await cfgManager.load();
    expect(cfgManager.get('test')).toBe('test1');
    expect(cfgManager.configDir).toBe(path.dirname(localPath));

    await testUtil.fs.remove(localPath);
    cfgManager = new ConfigManager();
    await cfgManager.load();
    expect(cfgManager.get('test')).toBe('test2');
    expect(cfgManager.configDir).toBe(path.dirname(parentPath));

    await testUtil.fs.remove(parentPath);
    cfgManager = new ConfigManager();
    await cfgManager.load();
    expect(cfgManager.configDir).toBe(TANG_HOME);

    const testPath = testUtil.fs.joinPath(__dirname, '..', 'test.json');
    await testUtil.fs.writeJSON(testPath, {
      test: 'test3',
    });

    cfgManager = new ConfigManager();
    await cfgManager.load('test.json');
    expect(cfgManager.get('test')).toBe('test3');
    expect(cfgManager.configDir).toBe(path.dirname(testPath));

    await testUtil.fs.remove(testPath);
    cfgManager = new ConfigManager();
    await cfgManager.load();
    expect(cfgManager.configDir).toBe(TANG_HOME);

    process.cwd = origCwd;
  });
});

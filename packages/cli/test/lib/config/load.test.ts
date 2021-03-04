import * as path from 'path';
import * as testUtil from '../../util';
import { TANG_HOME, TANG_CONFIG_FILENAME } from '../../../src/consts';
import { ConfigManager, defaultConfiguration } from '../../../src/lib/config';

const tangUtil = testUtil.tangUtil;

describe('tang/cli/config.manager load：配置加载', () => {
  const tmpDir = testUtil.resolveTmpDir();

  beforeEach(async () => {
    await tangUtil.fs.ensureDir(tmpDir);
    await tangUtil.fs.emptyDir(tmpDir);
  });

  it('加载默认配置', async () => {
    const cfgManager = new ConfigManager({});

    expect(cfgManager.configDir).toBe(TANG_HOME);
    expect(cfgManager.configFileName).toBe(TANG_CONFIG_FILENAME);

    expect(cfgManager.configFilePath).toBe(
      path.join(TANG_HOME, TANG_CONFIG_FILENAME),
    );
  });

  it('加载临时配置', async () => {
    const cfgManager = new ConfigManager({ configDir: tmpDir });

    const config = await cfgManager.load();
    expect(config).toEqual(defaultConfiguration);

    config.textOptions = { isTest: true };
    await cfgManager.save();

    expect(cfgManager.configuration.textOptions).toEqual({ isTest: true });
    expect(cfgManager.configFilePath).toBe(`${tmpDir}/tang.json`);

    const config2 = await cfgManager.load();
    expect(config2.textOptions).toEqual({ isTest: true });

    await tangUtil.fs.writeFile(cfgManager.configFilePath, 'test_error');

    await expect(() => cfgManager.load()).rejects.toThrow('配置文件格式错误。');

    await tangUtil.fs.emptyDir(tmpDir);
  });
});

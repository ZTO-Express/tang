import * as path from 'path';
import { GenericConfigObject, utils } from '@devs-tang/common';
import { json5, fs } from '../utils';
import { TANG_HOME, TANG_CONFIG_FILENAME } from '../consts';
import { Config } from './interfaces';
import { IO, LocalIO } from '../io';
import { getDefaultConfig } from './defaults';

// 配置选项
export interface ConfigManagerOptions extends GenericConfigObject {
  configDir?: string;
  configFile?: string;
}

/**
 * 配置管理器
 */
export class ConfigManager {
  private _configDir: string;
  private _io: IO;

  readonly configFileName: string;

  config: Config;

  constructor(options?: ConfigManagerOptions) {
    options = Object.assign({}, options);

    this._configDir = options.configDir;
    this.configFileName = options.configFile || TANG_CONFIG_FILENAME;
    this.config = getDefaultConfig();
  }

  get configDir() {
    return this._configDir;
  }

  get configFilePath() {
    return path.join(this.configDir, this.configFileName);
  }

  // 获取配置信息
  get<T = any>(path: string): T {
    if (path === '.') {
      return this.config as T;
    }

    const result = utils.get(this.config, path);
    return result;
  }

  // 设置配置
  unset(path: string) {
    utils.unset(this.config, path);
  }

  // 设置配置
  set(path: string, value: any) {
    utils.set(this.config, path, value);
  }

  // 加载配置
  async load(name?: string): Promise<Config> {
    name = name || this.configFileName;
    if (!this._configDir) {
      this._configDir = await this.retrieveConfigDir(name);
    }

    await fs.ensureDir(this._configDir);
    this._io = new LocalIO(this._configDir);

    const content: string | undefined = await this._io.readAnyOf([name]);

    if (!content) {
      this.config = getDefaultConfig();
      return this.config;
    }

    let fileConfig: any = {};

    try {
      fileConfig = json5.parse(content);
    } catch (err) {
      throw new Error('配置文件格式错误。');
    }

    this.config = {
      ...getDefaultConfig(),
      ...fileConfig,
    };

    return this.config;
  }

  /** 获取配置文件目录 */
  async retrieveConfigDir(name: string) {
    const filePath = await fs.lookupFile(name);

    if (filePath === undefined) {
      return TANG_HOME;
    }

    return path.dirname(filePath);
  }

  /** 保存配置 */
  async save() {
    const updatedConfig = this.getUpdatedConfig();
    return this._io.write(updatedConfig, { file: this.configFileName });
  }

  /** 获取与默认配置不同的配置项，以便于保存 */
  getUpdatedConfig() {
    const defaultConfig = getDefaultConfig();
    const config: any = this.config;

    const saveConfig: any = {};

    Object.keys(config).forEach(key => {
      if (config[key] && !utils.deepEqual(config[key], defaultConfig[key])) {
        saveConfig[key] = config[key];
      }
    });

    return saveConfig;
  }
}

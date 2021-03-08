import { util as tangUtil } from '@tang/tang';
import * as path from 'path';
import { TANG_HOME, TANG_CONFIG_FILENAME } from '../../consts';
import { Configuration, Loader, GenericConfigObject } from '../../common';
import { LocalLoader } from '../loaders';
import { defaultConfiguration } from './defaults';

// 配置选项
export interface ConfigManagerOptions extends GenericConfigObject {
  configDir?: string;
  configFile?: string;
}

/**
 * 配置管理器
 */
export class ConfigManager {
  options: ConfigManagerOptions = {};

  readonly configDir: string;
  readonly configFileName: string;

  loader: Loader;
  configuration: Configuration;

  constructor(options?: ConfigManagerOptions) {
    options = Object.assign({}, options);

    this.configDir = options.configDir || TANG_HOME;
    this.configFileName = options.configFile || TANG_CONFIG_FILENAME;
    this.configuration = defaultConfiguration;

    this.loader = new LocalLoader(this.configDir);
  }

  get configFilePath() {
    return path.join(this.configDir, this.configFileName);
  }

  // 加载配置
  async load(name?: string): Promise<Configuration> {
    name = name || this.configFileName;
    const content: string | undefined = await this.loader.readAnyOf([name]);

    if (!content) {
      this.configuration = defaultConfiguration;
      return this.configuration;
    }

    let fileConfig: any = {};

    try {
      fileConfig = tangUtil.json5.parse(content);
    } catch (err) {
      throw new Error('配置文件格式错误。');
    }

    this.configuration = {
      ...defaultConfiguration,
      ...fileConfig,
    };

    return this.configuration;
  }

  // 设置配置
  async set() {
    debugger;
  }

  /** 保存配置 */
  async save() {
    return this.loader.write(this.configuration, {
      file: this.configFileName,
    });
  }
}

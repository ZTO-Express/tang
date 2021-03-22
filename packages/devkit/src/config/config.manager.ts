import * as path from 'path';
import { GenericConfigObject, utils } from '@devs-tang/common';
import { json5 } from '../utils';
import { TANG_HOME, TANG_CONFIG_FILENAME } from '../consts';
import { Config } from './interfaces';
import { IO, LocalIO } from '../io';
import { defaultConfig } from './defaults';

// 配置选项
export interface ConfigManagerOptions extends GenericConfigObject {
  configDir?: string;
  configFile?: string;
}

/**
 * 配置管理器
 */
export class ConfigManager {
  readonly configDir: string;
  readonly configFileName: string;

  io: IO;
  config: Config;

  constructor(options?: ConfigManagerOptions) {
    options = Object.assign({}, options);

    this.configDir = options.configDir || TANG_HOME;
    this.configFileName = options.configFile || TANG_CONFIG_FILENAME;
    this.config = defaultConfig;

    this.io = new LocalIO(this.configDir);
  }

  get configFilePath() {
    return path.join(this.configDir, this.configFileName);
  }

  // 获取配置信息
  get<T>(path: string): T {
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
    const content: string | undefined = await this.io.readAnyOf([name]);

    if (!content) {
      this.config = defaultConfig;
      return this.config;
    }

    let fileConfig: any = {};

    try {
      fileConfig = json5.parse(content);
    } catch (err) {
      throw new Error('配置文件格式错误。');
    }

    this.config = {
      ...defaultConfig,
      ...fileConfig,
    };

    return this.config;
  }

  /** 保存配置 */
  async save() {
    return this.io.write(this.config, {
      file: this.configFileName,
    });
  }
}

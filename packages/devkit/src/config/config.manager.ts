import { GenericConfigObject } from '@devs-tang/common';
import * as path from 'path';
import { json5, fs, utils } from '../utils';
import { TANG_HOME, TANG_CONFIG_FILENAME } from '../consts';
import { IO, LocalIO } from '../io';
import { ProjectWorkspace } from '../project';

import { Config } from './declarations';
import { getDefaultConfig } from './defaults';

// 配置选项
export interface ConfigManagerOptions extends GenericConfigObject {
  configPath?: string;
}

/**
 * 配置管理器
 * tang的配置分为全局配置和工作区配置
 * 针对不同的场景，为避免干扰和疑惑，两类配置为相互排斥
 * 全局配置特点：配置文件采用json格式，可以通过命令操作全局配置，无法在工作区使用
 * 工作区配置特点：配置文件采用js格式，无法通过命令操作配置，只能在工作区下使用
 */
export class ConfigManager {
  private _configPath: string;
  private _io: IO;

  config: Config;

  constructor(options?: ConfigManagerOptions) {
    options = Object.assign({}, options);

    this._configPath = options.configPath;
    if (this._configPath) {
      this._configPath = fs.absolutePath(this._configPath, process.cwd());
    }

    this.config = getDefaultConfig();
  }

  // 配置路径
  get configPath() {
    return this._configPath;
  }

  // 当前配置是否工作区配置
  get isWorkspace() {
    return this.config && this.config.isWorkspace == true;
  }

  // 当前工作区根路径
  get workspaceRootDir() {
    return this.isWorkspace ? undefined : this.config.rootDir;
  }

  // 获取配置信息
  get<T = any>(pathStr: string, defaultValue?: T): T {
    if (pathStr === '.') {
      return this.config as T;
    }

    const result = utils.get(this.config, pathStr, defaultValue);
    return result;
  }

  /** 获取配置下options节点下选项 */
  getOptions<T = any>(pathStr: string, defaultValue?: T): T {
    if (!pathStr || pathStr === '.') {
      pathStr = 'options';
    } else {
      pathStr = `options.${pathStr}`;
    }
    return this.get<T>(pathStr, defaultValue);
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
  async load(): Promise<Config> {
    let config = await this.readWorkspaceConfig();

    if (!config || !config.isWorkspace) {
      config = await this.readJsonConfig();
    }

    this.config = config;
    return this.config;
  }

  // 读取工作区配置
  async readWorkspaceConfig() {
    const ws = await ProjectWorkspace.getInstance(this._configPath);
    const config = ws.get('.');
    return config;
  }

  // 读取Json配置文件
  async readJsonConfig() {
    const configDir = await this.retrieveJsonConfigDir();

    await fs.ensureDir(configDir);
    this._io = new LocalIO(configDir);

    const content: string | undefined = await this._io.readAnyOf([
      TANG_CONFIG_FILENAME,
    ]);

    if (!content) {
      this.config = {
        configDir,
        ...getDefaultConfig(),
      };

      return this.config;
    }

    let fileConfig: any = {};

    try {
      fileConfig = json5.parse(content);
    } catch (err) {
      throw new Error('配置文件格式错误。');
    }

    return {
      configDir,
      ...getDefaultConfig(),
      ...fileConfig,
    };
  }

  /** 保存配置 */
  async save() {
    if (this.isWorkspace) {
      throw new Error('无法使用命令保存工作区配置，请手工修改。');
    }

    const updatedConfig = this.getUpdatedConfig();
    return this._io.write(updatedConfig, { file: TANG_CONFIG_FILENAME });
  }

  /** 获取配置文件目录 */
  async retrieveJsonConfigDir() {
    const filePath = await fs.lookupFile(TANG_CONFIG_FILENAME);

    if (filePath === undefined) {
      return TANG_HOME;
    }

    return path.dirname(filePath);
  }

  /** 获取与默认配置不同的配置项，以便于保存 */
  getUpdatedConfig() {
    const defaultConfig = getDefaultConfig();
    const config: any = this.config || {};

    const ignoreKeys = ['configDir']; // 应当忽略保存的key

    const updatedConfig: any = {};

    for (const key in config) {
      if (ignoreKeys.includes(key)) {
        continue;
      }

      if (config[key] && !utils.deepEqual(config[key], defaultConfig[key])) {
        updatedConfig[key] = config[key];
      }
    }

    return updatedConfig;
  }
}

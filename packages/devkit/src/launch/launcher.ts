/**
 * Tang启动器
 * 每次命令执行用于构建运行环境
 */

import * as path from 'path';

import {
  GenericConfigObject,
  InvalidArguments,
  SpecialObject,
  TangCompilerGenerateOptions,
  TangCompilerLoadOptions,
  utils,
} from '@devs-tang/common';

import { tang } from '@devs-tang/core';

import { fs, json5 } from '../utils';
import {
  TANG_LAUNCH_CONFIG_FILENAME,
  TANG_LAUNCH_CONFIG_PRESETS,
  TANG_LAUNCH_CONFIG_PRESET_DEFAULT,
} from '../consts';
import { ConfigManager } from '../config';
import { PluginManager } from '../plugin';

import { mergePresetOptions } from './options';

export interface PresetConfigData {
  name: string;
  use?: boolean;
  plugin?: string;
  options?: GenericConfigObject;
}

export interface LaunchPresetConfig extends SpecialObject {
  plugin?: string;
  preset?: string;
}

/** 加载session */
export interface LaunchConfig {
  preset?: LaunchPresetConfig;
}

export class TangLauncher {
  readonly configManager: ConfigManager;
  readonly pluginManager: PluginManager;

  private static instance: TangLauncher;

  private launchConfig: LaunchConfig;
  private launchConfigFileName: string;

  private constructor() {
    this.configManager = new ConfigManager();
    this.pluginManager = new PluginManager();

    this.launchConfigFileName = TANG_LAUNCH_CONFIG_FILENAME;
  }

  /**
   * 获取加载器实例
   * @param force 强制重新实例化加载器
   * @returns
   */
  static async getInstance(force = false) {
    if (!TangLauncher.instance || force === true) {
      const launder = new TangLauncher();
      TangLauncher.instance = launder;
      await launder.initialize();
    }

    return TangLauncher.instance;
  }

  get configDir() {
    return this.configManager.configDir;
  }

  get launchConfigFilePath() {
    return path.join(this.configDir, this.launchConfigFileName);
  }

  // 初始化加载器
  async initialize() {
    await fs.ensureDir(this.configDir);

    // 加载配置
    this.launchConfig =
      (await fs.resolveFile(this.launchConfigFilePath, 'json')) || {};

    await this.configManager.load();
  }

  /**
   * 加载指定的插件预设
   * @param name
   * @returns
   */
  async use(name?: string, options?: GenericConfigObject): Promise<any> {
    name = name || TANG_LAUNCH_CONFIG_PRESET_DEFAULT;

    if (name === TANG_LAUNCH_CONFIG_PRESET_DEFAULT) {
      this.setPresetConfig(name, { use: true, options });
      return this.save();
    }

    const presetInfo = this.parsePresetName(name);

    if (!presetInfo) return undefined;

    const presetFullName = this.getPresetFullName(presetInfo);

    if (presetInfo.plugin) {
      const existsPlugin = await this.pluginManager.exists(presetInfo.plugin);

      if (!existsPlugin) {
        const plugin = await this.pluginManager.add(presetInfo.plugin);

        if (!plugin) {
          throw new Error('插件安装失败。');
        }
      }
    }

    this.setPresetConfig(presetFullName, { use: true, options });
    return this.save();
  }

  /**
   * 加载文档
   * @param entry 文档入口
   * @param presetName 预设名称
   * @returns
   */
  async load(
    entry: string,
    presetName?: string,
    options?: TangCompilerLoadOptions,
  ) {
    const opts = await this.options(presetName, options);

    const compiler = await tang(opts);
    const compilation = await compiler.load(entry, options);
    return compilation;
  }

  /** 获取生成完整选项 */
  async options(presetName?: string, options?: GenericConfigObject) {
    const preset = await this.getPresetConfig(presetName);

    const opts = mergePresetOptions(preset, options);

    return opts;
  }

  /**
   * 生成文档
   * @param entry 文档入口
   * @param presetName 预设名称
   * @returns
   */
  async generate(
    entry: string,
    presetName?: string,
    options?: TangCompilerLoadOptions & TangCompilerGenerateOptions,
  ) {
    const preset = await this.getPresetConfig(presetName);

    const opts = mergePresetOptions(preset, options);

    const compiler = await tang(opts);
    const compilation = await compiler.load(entry);
    const output = await compiler.generate(compilation.document, opts as any);
    return output;
  }

  /** 获取编译器完整选项 */
  async inspect(presetName?: string, options?: GenericConfigObject) {
    const preset = await this.getPresetConfig(presetName);

    const opts = mergePresetOptions(preset, options);

    return opts;
  }

  /**
   * 清理无效插件、插件缓存，无效预设
   */
  async prune() {
    await this.pluginManager.prune();
  }

  /** 获取当前加载配置 */
  get(name: string) {
    return utils.get(this.launchConfig, name);
  }

  /** 设置当前加载配置 */
  set(name: string, value: any) {
    if (!name) throw new InvalidArguments('请提供配置名称');

    utils.set(this.launchConfig, name, value);
  }

  /** 去除设置当前加载配置 */
  unset(name: string) {
    if (!name) throw new InvalidArguments('请提供配置名称');

    utils.unset(this.launchConfig, name);
  }

  /** 保存配置 */
  async save() {
    const text = json5.stringify(this.launchConfig, { space: 2 });
    await fs.writeFile(this.launchConfigFilePath, text);
    return true;
  }

  /** 设置指定预设 */
  setPresetConfig(name: string, options: GenericConfigObject) {
    if (!name) return undefined;

    const presetPath = `${TANG_LAUNCH_CONFIG_PRESETS}.${name}`;

    let presetData = this.get(presetPath);

    presetData = utils.deepMerge(presetData, options);

    this.set(presetPath, presetData);

    return presetData;
  }

  /**
   * 获取指定或当前预设
   * @param name 预设名称
   * @returns 当name为空时，获取当前预设（配置文件中）
   */
  async getPresetConfig(name?: string) {
    name = name || TANG_LAUNCH_CONFIG_PRESET_DEFAULT;

    const presetInfo = this.parsePresetName(name);
    const presetFullName = this.getPresetFullName(presetInfo);

    const presetPath = `${TANG_LAUNCH_CONFIG_PRESETS}.${presetFullName}`;

    const presetData = this.get(presetPath);

    return presetData;
  }

  /**
   * 获取预设全名
   * @param pluginName
   * @param presetName
   * @returns
   */
  getPresetFullName(options: PresetConfigData) {
    if (!options.plugin) return undefined;

    const _pluginName = options.plugin;
    const _presetName = options.name || 'default';

    return `plugin:${_pluginName}:${_presetName}`;
  }

  /**
   * 解析预设名称
   * @param presetName
   */
  parsePresetName(presetName: string) {
    if (!presetName) return undefined;

    const parts = presetName.split(':');

    if (parts[0] === 'plugin') {
      return {
        plugin: parts[1],
        name: parts[2],
      };
    } else if (parts.length === 2) {
      return {
        plugin: parts[0],
        name: parts[1],
      };
    } else if (parts.length === 1) {
      return {
        plugin: parts[0],
        name: 'default',
      };
    }

    return undefined;
  }
}

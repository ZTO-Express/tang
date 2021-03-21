/**
 * Tang启动器
 * 每次命令执行用于构建运行环境
 */

import * as path from 'path';

import {
  GenericConfigObject,
  InvalidArguments,
  NotFoundError,
  SpecialObject,
  TangCompilerGenerateOptions,
  TangCompilerLoadOptions,
  TangPreset,
  utils,
} from '@tang/common';

import { tang } from '@tang/core';

import { fs } from '../utils';
import {
  TANG_LAUNCH_CONFIG_FILENAME,
  TANG_LAUNCH_CONFIG_PRESET,
} from '../consts';
import { ConfigManager } from '../config';
import { PluginManager } from '../plugin';

export interface PresetConfigData {
  plugin?: string;
  preset?: string;
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
  async use(name?: string) {
    const presetData = this.parsePresetName(name);

    if (!presetData) {
      throw new InvalidArguments(`预设名称格式错误`);
    }

    const preset = this.getPreset(presetData);

    if (!preset) {
      throw new NotFoundError(`未找到预设${name}`);
    }

    this.set(TANG_LAUNCH_CONFIG_PRESET, presetData);

    await this.save();

    return preset;
  }

  /**
   * 安装插件
   * @param name 插件名称
   * @param version 插件版本
   */
  async install(name?: string, options?: GenericConfigObject) {
    return this.pluginManager.add(name, options);
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
    const preset = await this.getPreset(presetName);

    if (!preset) {
      throw new NotFoundError('无法加载文档，未找到可用的预设');
    }

    const compiler = await tang(preset);
    const compilation = await compiler.load(entry, options);
    return compilation;
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
    options?: TangCompilerGenerateOptions,
  ) {
    const preset = await this.getPreset(presetName);

    if (!preset) {
      throw new NotFoundError('无法加载文档，未找到可用的预设');
    }

    const compiler = await tang(preset);
    const compilation = await compiler.load(entry);
    const output = await compiler.generate(compilation.document, options);
    return output;
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
    await fs.writeJSON(this.launchConfigFilePath, this.launchConfig);
  }

  /**
   * 获取指定或当前预设
   * @param name 预设名称
   * @returns 当name为空时，获取当前预设（配置文件中）
   */
  async getPreset(name?: string | PresetConfigData) {
    let presetData: PresetConfigData;

    if (utils.isObject(name)) {
      presetData = name;
    } else if (name) {
      presetData = this.parsePresetName(name);
    } else {
      presetData = this.get(TANG_LAUNCH_CONFIG_PRESET);
    }

    if (!presetData) return undefined;

    let preset: TangPreset;

    if (presetData.plugin) {
      const plugin = await this.pluginManager.get(presetData.plugin);

      if (!plugin) {
        throw new NotFoundError(`插件${presetData.plugin}不存在`);
      }

      const presetName = presetData.preset;
      if (!presetName) {
        preset = plugin.preset || (plugin.presets && plugin.presets[0]);
      } else if (Array.isArray(plugin.presets)) {
        preset = plugin.presets.find(it => it.name === presetName);
      }
    }

    return preset;
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
    const _presetName = options.preset || 'default';

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
        preset: parts[2],
      };
    } else if (parts.length === 2) {
      return {
        plugin: parts[0],
        preset: parts[1],
      };
    } else if (parts.length === 1) {
      return {
        plugin: parts[0],
        preset: undefined,
      };
    }

    return undefined;
  }
}

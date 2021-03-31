/**
 * Tang启动器
 * 每次命令执行用于构建运行环境
 */

import * as path from 'path';

import {
  GenericConfigObject,
  NotImplementedError,
  SpecialObject,
  TangCompilerGenerateOptions,
  TangCompilerLoadOptions,
} from '@devs-tang/common';

import { createCompiler, NormalizedTangOptions } from '@devs-tang/core';

import { fs } from '../utils';
import { ConfigManager } from '../config';
import { PluginManager } from '../plugin';

import { getNormalizedOptions, mergePresetOptions } from './options';
import { PresetManager } from './preset-manager';

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
  readonly presetManager: PresetManager;

  private static instance: TangLauncher;

  private constructor() {
    this.configManager = new ConfigManager();
    this.pluginManager = new PluginManager();
    this.presetManager = new PresetManager(this);
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

  // 初始化加载器
  async initialize() {
    await fs.ensureDir(this.configDir);
    await this.configManager.load();
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
    const opts = await this.getPresetOptions(presetName, options);

    const compiler = await createCompiler(opts);
    const compilation = await compiler.load(entry, options);
    return compilation;
  }

  /** 删除插件 */
  async deletePlugin(pluginName: string) {
    if (!pluginName) return undefined;

    // 删除插件
    const plugin = await this.pluginManager.delete(pluginName);

    // 删除插件相关预设
    const presetNames = this.presetManager.getAllConfigNames(pluginName);
    presetNames.forEach(name => this.presetManager.unsetConfig(name));
    await this.presetManager.saveConfig();

    return plugin;
  }

  /**
   * 获取当前预设
   * @param name
   */
  async getPreset(presetName?: string) {
    const nameInfo = this.presetManager.parseName(presetName);
    if (!nameInfo) return undefined;

    const preset = await this.pluginManager.getPreset(
      nameInfo.plugin,
      nameInfo.name,
    );
    return preset;
  }

  /**
   * 获取预设所属插件
   * @param name
   */
  async getPresetPlugin(presetName?: string) {
    const nameInfo = this.presetManager.parseName(presetName);
    if (!nameInfo || !nameInfo.plugin) return undefined;

    const plugin = await this.pluginManager.get(nameInfo.plugin);
    return plugin;
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
    const opts = await this.getPresetOptions(presetName, options);

    const compiler = await createCompiler(opts);
    const compilation = await compiler.load(entry);
    const output = await compiler.generate(compilation.document, opts as any);
    return output;
  }

  /** 获取生成完整选项 */
  async getPresetOptions(presetName?: string, options?: NormalizedTangOptions) {
    let presetConfig: any;

    if (!presetName) {
      presetConfig = this.presetManager.getUsedConfig();
    } else {
      presetConfig = this.presetManager.getConfigByName(presetName);
    }

    let opts = mergePresetOptions(presetConfig, options);

    opts = getNormalizedOptions(opts);

    return opts;
  }

  /** 获取编译器完整选项 */
  async inspect(presetName?: string, options?: GenericConfigObject) {
    throw new NotImplementedError();
  }

  /**
   * 清理无效插件、插件缓存，无效预设
   */
  async prune() {
    await this.pluginManager.prune();
  }
}

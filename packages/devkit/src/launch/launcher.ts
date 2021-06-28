/**
 * Tang启动器
 * 每次命令执行用于构建运行环境
 */

import {
  TangCompilation,
  TangCompilerContext,
  TangCompilerLoadOptions,
  TangCompilerInspectOptions,
  TangCompilerProcessOptions,
  TangModuleTypes,
  TangProcessorTypeKeys,
} from '@devs-tang/common';

import {
  createDefaultCompiler,
  getPresetProcessorConfigData,
} from '@devs-tang/core';

import { utils } from '../utils';
import { ConfigManager } from '../config';
import { PluginAddOptions, PluginManager } from '../plugin';
import { ProjectWorkspace } from '../project';
import { PresetManager, PresetWithConfigData } from './preset-manager';

/**
 * tang的加载器，也是tang的编译上下文
 */
export class TangLauncher implements TangCompilerContext {
  readonly configManager: ConfigManager;
  readonly pluginManager: PluginManager;
  readonly presetManager: PresetManager;

  private _workspace: ProjectWorkspace;

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

  get workspace() {
    return this._workspace;
  }

  // 是否工作区加载器
  get isWorkspace() {
    return this.configManager.isWorkspace;
  }

  // 初始化加载器
  async initialize() {
    await this.configManager.load();

    const workspace = await ProjectWorkspace.createInstance();
    if (workspace.exists()) {
      this._workspace = workspace;
    }
  }

  /**
   * 加载文档
   * @param entry 文档入口
   * @param presetName 预设名称
   * @returns
   */
  async load(
    entry: string,
    presetName?: string | TangCompilerLoadOptions,
    options?: TangCompilerLoadOptions,
  ): Promise<TangCompilation> {
    if (utils.isObject(presetName)) {
      options = presetName;
      presetName = undefined;
    }

    const opts = await this.getPresetWithConfigOptions(
      presetName as string,
      options,
    );

    if (!opts) return undefined;

    const compiler = await createDefaultCompiler(opts.preset, this);
    const compilation = await compiler.load(entry, opts.processOptions);
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
    presetName?: string | TangCompilerProcessOptions,
    options?: TangCompilerProcessOptions,
  ) {
    if (utils.isObject(presetName)) {
      options = presetName;
      presetName = undefined;
    }

    const opts = await this.getPresetWithConfigOptions(
      presetName as string,
      options,
    );

    if (!opts) return undefined;

    const compiler = await createDefaultCompiler({ ...opts.preset }, this);

    const compilation = await compiler.load(entry, opts.processOptions);

    const output = await compiler.generate(
      compilation.document,
      opts.processOptions,
    );

    return output;
  }

  /**
   * 获取编译器完整选项
   */
  async inspect(presetName: string, options: TangCompilerInspectOptions) {
    const opts = await this.getPresetWithConfigOptions(presetName, options);

    if (!opts || !opts.preset) return undefined;

    const compiler = await createDefaultCompiler(opts.preset, this);

    const processOptions = opts.processOptions as TangCompilerInspectOptions;
    const processors: any = await compiler.inspect(processOptions);

    const inspectData: any = {
      name: opts.name,
      use: opts.use,
    };

    const inspectProcessOptions: any = {
      ...processOptions,
    };

    TangProcessorTypeKeys.forEach(key => {
      const configData = getPresetProcessorConfigData(processors[key]);
      if (configData) {
        inspectData[key] = configData;
      }

      const processOptionsData = getPresetProcessorConfigData(
        (processOptions as any)[key],
      );

      if (processOptionsData) {
        inspectProcessOptions[key] = processOptionsData;
      }
    });

    inspectData.processOptions = inspectProcessOptions;

    return inspectData;
  }

  /**
   * 安装插件
   */
  async install(name: string, options?: PluginAddOptions) {
    return this.pluginManager.add(name, options);
  }

  /** 删除插件 */
  async delete(pluginName: string) {
    if (!pluginName) return undefined;

    // 删除插件
    const result = await this.pluginManager.delete(pluginName);

    // 删除插件相关预设
    const presetNames = this.presetManager.getAllConfigNames(
      `${TangModuleTypes.plugin}:${pluginName}:`,
    );

    presetNames.forEach(name => this.presetManager.unsetConfig(name));
    await this.presetManager.saveConfig();

    return result;
  }

  /**
   * 清理无效插件、插件缓存，无效预设
   */
  async prune() {
    return this.pluginManager.prune();
  }

  /**
   * 加载或获取指定的预设
   */
  async use(name?: string, options?: TangCompilerProcessOptions) {
    return this.presetManager.use(name, options);
  }

  /** 获取正在使用的插件 */
  async getPlugin(name?: string) {
    let pluginName = name;

    if (!pluginName) {
      pluginName = this.presetManager.getUsedPluginName();
    }

    const plugin = await this.pluginManager.get(pluginName);
    return plugin;
  }

  /**
   * 获取生成完整选项
   * @param presetName 预设名称
   * @param options 编译处理选项
   * @returns
   */
  async getPresetWithConfigOptions(
    presetName: string,
    options?: TangCompilerProcessOptions,
  ) {
    let presetWithConfig: PresetWithConfigData;

    if (!presetName) {
      presetWithConfig = await this.presetManager.getUsedPresetWithConfig();
    } else {
      presetWithConfig = await this.presetManager.getPresetWithConfigByName(
        presetName,
      );
    }

    if (!presetWithConfig) return undefined;

    presetWithConfig.processOptions = utils.deepMerge(
      presetWithConfig.processOptions,
      options,
    ) as TangCompilerProcessOptions;

    return presetWithConfig;
  }
}

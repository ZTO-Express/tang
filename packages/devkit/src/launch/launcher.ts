/**
 * Tang启动器
 * 每次命令执行用于构建运行环境
 */

import {
  TangCompilation,
  TangCompilerLoadOptions,
  TangModuleTypes,
  utils,
} from '@devs-tang/common';

import {
  createCompiler,
  CompilerInspectOptions,
  CompilerProcessOptions,
  getPresetProcessorConfigData,
} from '@devs-tang/core';

import { fs } from '../utils';
import { ConfigManager } from '../config';
import { PluginAddOptions, PluginManager } from '../plugin';
import { PresetManager, PresetWithConfigData } from './preset-manager';

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

    const compiler = await createCompiler(opts.preset);
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
    presetName?: string | CompilerProcessOptions,
    options?: CompilerProcessOptions,
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

    const compiler = await createCompiler({ ...opts.preset });

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
  async inspect(presetName: string, options: CompilerInspectOptions) {
    const opts = await this.getPresetWithConfigOptions(presetName, options);

    const compiler = await createCompiler(opts.preset);

    const processors: any = await compiler.inspect(
      opts.processOptions as CompilerInspectOptions,
    );

    const inspectData: any = {
      name: opts.name,
      use: opts.use,
      processOptions: opts.processOptions,
    };

    Object.keys(processors).forEach(key => {
      inspectData[key] = getPresetProcessorConfigData(processors[key]);
    });

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
  async use(name?: string, options?: CompilerProcessOptions) {
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
    options?: CompilerProcessOptions,
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
    ) as CompilerProcessOptions;

    return presetWithConfig;
  }
}

/**
 * Tang启动器
 * 每次命令执行用于构建运行环境
 */

import { Compiler } from '@tang/core';

import { ConfigManager } from '../config';
import { PluginManager } from '../plugin';
import { NotImplementedError } from '@tang/common/lib';

export class TangLauncher {
  readonly configManager: ConfigManager;
  readonly pluginManager: PluginManager;

  private static _launcher: TangLauncher;

  private constructor() {
    this.configManager = new ConfigManager();
    this.pluginManager = new PluginManager(this);
  }

  /** 获取实例 */
  static getInstance() {
    if (!TangLauncher._launcher) {
      TangLauncher._launcher = new TangLauncher();
    }

    return TangLauncher._launcher;
  }

  /** 加载指定的插件 */
  async use(name?: string) {
    // const { presetManager } = TangLauncher.getInstance();
    // const preset = await presetManager.use(name);
    // return preset;
  }

  /**
   * 获取指定或当前预设
   * @param name 预设名称
   * @param version 预设版本
   * @returns 当name为空时，获取当前预设（配置文件中）
   */
  async preset(name?: string) {
    throw new NotImplementedError();
  }

  /**
   * 安装插件
   * @param name 插件名称
   * @param version 插件版本
   */
  async install(name?: string, force = false) {
    await this.pluginManager.add(name, { force });
  }

  /**
   * 加载文档
   * @param nameOrFile
   */
  async load(entry: string) {
    // const preset = await this.preset();
    // const compiler = new Compiler(preset);
    // const compilation = await compiler.load(entry);
    // return compilation;
  }

  /** 生成文档 */
  async generate(entry: string) {
    // const preset = await this.preset();
    // const compiler = new Compiler(preset);
    // const compilation = await this.load(entry);
    // const output = await compiler.generate(compilation.document);
    // return output;
  }

  /**
   * 清理无效插件、插件缓存，无效预设
   */
  async prune() {
    await this.pluginManager.prune();
  }
}

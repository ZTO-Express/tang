import { GenericConfigObject } from '@devs-tang/common';

/** 插件名称信息 */
export interface PluginNameInfo {
  name: string; // 不包含前缀但包含版本号 shortName[@version]
  shortName: string; // 不包含前缀和版本号
  prefixName: string; // 包含前缀名称 [prefix]shortName
  fullName: string; // 包含版本 [prefix]shortName[@version]
  version?: string; // 版本号
}

// 配置选项
export interface PluginManagerOptions extends GenericConfigObject {
  pluginDir?: string;
}

// 插件安装类型 (目前暂不支持脚本安装)
export type PluginInstallTypes = 'npm' | 'npm_link' | 'shell';

export interface BasePluginInstallOptions extends PluginNameInfo {
  type?: PluginInstallTypes;
  cwd?: string; // 安装命令执行目录
  force?: boolean; // 强制安装标志（强制删除原安装并重新安装）
}

export interface PluginNpmInstallOptions extends BasePluginInstallOptions {
  package?: string; // 包名
  registry?: string; // npm仓库
  extArgs?: string; // 额外参数
}

export interface PluginNpmLinkInstallOptions extends BasePluginInstallOptions {
  package: string; // npm仓库
  extArgs?: string; // 额外参数
}

export interface PluginShellInstallOptions extends BasePluginInstallOptions {
  install: string[]; // 安装脚本
}

// 插件安装选项
export type PluginInstallOptions =
  | PluginNpmInstallOptions
  | PluginNpmLinkInstallOptions
  | PluginShellInstallOptions;

// 插件添加选项
export interface PluginAddOptions
  extends Partial<PluginNpmInstallOptions & PluginNpmLinkInstallOptions> {
  install?: boolean | string[];
}

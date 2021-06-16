import { GenericConfigObject } from '@devs-tang/common';

interface PluginConfig {
  homeDir?: string; // 插件安装目录
  repository?: string; // 指定安装仓库
  [key: string]: any;
}

interface MeshConfig {
  homeDir?: string; // 预设安装目录
  [key: string]: any;
}

/** 全局配置 */
export interface Config {
  plugin?: PluginConfig;
  mesh?: MeshConfig;
  [key: string]: any;
}

/** 工作区配置 */
export interface WorkspaceConfig extends GenericConfigObject {
  rootDir?: string;
}

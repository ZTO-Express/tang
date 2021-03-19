interface PluginConfig {
  homeDir?: string; // 插件安装目录
  repository?: string; // 指定安装仓库
  [key: string]: any;
}

interface MeshConfig {
  homeDir?: string; // 预设安装目录
  loaded?: string; // 当前加载预设名称
  [key: string]: any;
}

export interface Config {
  plugin?: PluginConfig;
  mesh?: MeshConfig;
  [key: string]: any;
}

export interface ConfigLoader {
  load(name?: string): Required<Config> | Promise<Required<Config>>;
}

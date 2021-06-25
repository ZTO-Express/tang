export enum TangModuleTypes {
  core = 'core', // 核心模块
  devkit = 'devkit', // 开发包模块
  openapi = 'openapi', // openapi模块
  plugin = 'plugin', // 插件模块
  workspace = 'workspace', // 工作区模块
}

export const TangModuleTypeKeys = Object.keys(TangModuleTypes).map(it => it);

export type TangModuleTypeNames = keyof typeof TangModuleTypes;

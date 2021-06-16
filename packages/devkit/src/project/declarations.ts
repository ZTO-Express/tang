import { GenericConfigObject } from '@devs-tang/common';

/** 工作区配置 */
export interface WorkspaceConfig extends GenericConfigObject {
  isWorkspace?: boolean;
  rootDir?: string;
}

/** 项目代码生成模版 */
export interface CodegenTemplate {
  fullPath: string;
  relativePath: string;
  content: string;
}

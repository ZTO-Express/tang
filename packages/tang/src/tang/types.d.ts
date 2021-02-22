export const VERSION: string;

// 错误类型
export interface TangError extends TangLogProps {
  parserError?: Error;
  stack?: string;
  watchFiles?: string[];
}

// 警告类型
export interface TangWarning extends TangLogProps {
  chunkName?: string;
  cycle?: string[];
  exporter?: string;
  exportName?: string;
  guess?: string;
  importer?: string;
  missing?: string;
  modules?: string[];
  names?: string[];
  reexporter?: string;
  source?: string;
  sources?: string[];
}

// 日志属性
export interface TangLogProps {
  code?: string;
  frame?: string;
  hook?: string;
  id?: string;
  loc?: {
    column: number;
    file?: string;
    line: number;
  };
  message: string;
  name?: string;
  plugin?: string;
  pluginCode?: string;
  pos?: number;
  url?: string;
}

export interface InputOptions {}

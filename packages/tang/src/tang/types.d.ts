// 版本信息
export const VERSION: string;

// 通用配置对象
export interface GenericConfigObject {
  [key: string]: unknown;
}

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

export type WarningHandlerWithDefault = (
  warning: TangWarning,
  defaultHandler: WarningHandler,
) => void;
export type WarningHandler = (warning: TangWarning) => void;

// 预设配置
export interface PresetOptions {
  name: string;
  version: string;
}

// 插件配置
export interface PluginOptions {
  name: string;
}

// Tang配置选项
export interface TangOptions {
  plugins?: PluginOptions[];
}

// 规范化之后的配置选项
export interface NormalizedTangOptions {
  loaders: Function[];
  parsers: Function[];
}

// 生成器配置选项
export interface CompilerOptions {
  loaders: DocumentLoader[];
  parsers: DocumentParser[];
}

// 文档
export interface Document {
  models?: { [key: string]: DocumentModel };
}

// 文档
export interface DocumentModel {
  [key: string]: any;
}

// 文档加载器
export interface DocumentLoader {
  name: string; // 加载器名称
  priority?: number; // 加载器优先级
  test?: string | RegExp | ((entry: string) => boolean); // 验证是否可以加载指定文档（一般通过目标名称/路径即可判断）
  loadOptions?: GenericConfigObject;
  load: (entry: string, options?: GenericConfigObject) => Promise<string>; // 加载方法
}

// 文档解析器
export interface DocumentParser {
  name: string; // 加载器名称
  priority?: number; // 加载器优先级
  parseOptions?: GenericConfigObject;
  parse: (
    content: string,
    options?: GenericConfigObject,
  ) => Promise<DocumentModel>;
}

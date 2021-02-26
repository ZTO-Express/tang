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
  defaultLoader?: string | TangDocumentLoader;
  loaders: TangDocumentLoader[];

  defaultParser?: string | TangDocumentParser;
  parsers: TangDocumentParser[];

  defaultGenerator?: string | TangDocumentGenerator;
  generators: TangDocumentGenerator[];

  defaultOutputer?: string | TangDocumentOutputer;
  outputers: TangDocumentOutputer[];
}

// 文档
export interface TangDocument {
  entry: string;
  content: string;
  model: TangDocumentModel;
}

// 文档
export interface TangDocumentModel {
  [key: string]: any;
}

// 文件块（用于生成文件）
export interface TangChunk {
  name: string;
  content: string | Buffer;
}

// 文档生成结果
export interface TangDocumentGeneration {
  chunks: TangChunk[];
}

export type TangDocumentProcesserTypes =
  | 'loader'
  | 'parser'
  | 'generator'
  | 'outputer';

// 当前文档处理器
export interface TangDocumentProcesser {
  type: TangDocumentProcesserTypes;
  name: string; // 处理器名称
  priority?: number; // 处理器优先级
  [prop: string]: any; // 其他属性，如处理选项等
}

// 当前文档处理器
export interface TangDocumentProcesser {
  type: TangDocumentProcesserTypes; // 处理器类型
  name: string; // 处理器名称
  priority?: number; // 处理器优先级
}

// 文档加载器
export interface TangDocumentLoader extends TangDocumentProcesser {
  test?: string | RegExp | ((entry: string) => boolean); // 验证是否可以加载指定文档（一般通过目标名称/路径即可判断）
  loadOptions?: GenericConfigObject;
  load: (entry: string, options?: GenericConfigObject) => Promise<string>; // 加载方法
}

// 文档解析器
export interface TangDocumentParser extends TangDocumentProcesser {
  parseOptions?: GenericConfigObject;
  parse: (
    content: string,
    options?: GenericConfigObject,
  ) => Promise<TangDocumentModel>;
}

// 文档生成器
export interface TangDocumentGenerator extends TangDocumentProcesser {
  generateOptions?: GenericConfigObject;
  generate: (
    document: TangDocument,
    options?: GenericConfigObject,
  ) => Promise<TangDocumentGeneration>;
}

export interface TangDocumentOutput {
  result: boolean;
  [prop: string]: any;
}

// 文件输出器
export interface TangDocumentOutputer extends TangDocumentProcesser {
  outputOptions?: GenericConfigObject;
  output: (
    generation: TangDocumentGeneration,
    options?: GenericConfigObject,
  ) => Promise<TangDocumentOutput>;
}

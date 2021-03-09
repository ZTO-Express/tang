// 通用配置对象
export interface GenericConfigObject {
  [key: string]: unknown;
}

// 错误类型
export interface TangError extends TangLogProps {
  parserError?: Error;
  stack?: string;
}

// 警告类型
export interface TangWarning extends TangLogProps {
  chunkName?: string;
  cycle?: string[];
  guess?: string;
}

// 日志属性
export interface TangLogProps {
  message: string;
  code?: string;
  name?: string;
  hook?: string;
  plugin?: string;
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
export interface NormalizedTangOptions extends TangCompilerOptions {
  [prop: string]: unknown;
}

// 生成器配置选项
export interface TangCompilerOptions {
  defaultLoader?: string | TangLoader;
  loaders: TangLoader[];

  defaultParser?: string | TangParser;
  parsers: TangParser[];

  defaultGenerator?: string | TangGenerator;
  generators: TangGenerator[];

  defaultOutputer?: string | TangOutputer;
  outputers: TangOutputer[];

  hooks?: TangHook[];
}

// 文档
export interface TangDocument {
  entry: string;
  content: string;
  model: TangModel;
}

// 文档
export interface TangModel {
  [key: string]: any;
}

// 文件块（用于生成文件）
export interface TangChunk {
  name: string;
  content: string | Buffer;
}

// 文档生成结果
export interface TangGeneration {
  document: TangDocument;
  chunks: TangChunk[];
}

export type TangProcessorTypes = 'loader' | 'parser' | 'generator' | 'outputer';

// 当前文档处理器
export interface TangProcessor {
  type: TangProcessorTypes; // 处理器类型
  name: string; // 处理器名称
  pluginName?: string; // 处理器所属插件
  priority?: number; // 处理器优先级
}

// 文档加载器
export interface TangLoader extends TangProcessor {
  test?: string | RegExp | ((entry: string) => boolean); // 验证是否可以加载指定文档（一般通过目标名称/路径即可判断）
  loadOptions?: GenericConfigObject;
  load: (entry: string, options?: GenericConfigObject) => Promise<string>; // 加载方法
}

// 文档解析器
export interface TangParser extends TangProcessor {
  parseOptions?: GenericConfigObject;
  parse: (content: string, options?: GenericConfigObject) => Promise<TangModel>;
}

// 文档生成结果
export interface TangGenerateResult {
  chunks: TangChunk[];
  [prop: string]: any;
}

// 文档生成器
export interface TangGenerator extends TangProcessor {
  generateOptions?: GenericConfigObject;
  generate: (
    document: TangDocument,
    options?: GenericConfigObject,
  ) => Promise<TangGenerateResult>;
}

export interface TangOutput {
  result: boolean;
  [prop: string]: any;
}

// 文件输出器
export interface TangOutputer extends TangProcessor {
  outputOptions?: GenericConfigObject;
  output: (
    generation: TangGeneration,
    options?: GenericConfigObject,
  ) => Promise<TangOutput>;
}

export interface TangCompilation {
  compiler: TangCompiler;
  document: TangDocument;
  loader: TangLoader;
  parser: TangParser;
}

/** 加载选项 */
export interface TangCompilerLoadOptions {
  entry?: string;
  loader?: string | TangLoader;
  loadOptions?: GenericConfigObject;
  parser?: string | TangParser;
  parseOptions?: GenericConfigObject;
}

/** 生成选项 */
export interface TangCompilerGenerateOptions {
  generator?: string | TangGenerator;
  generateOptions?: GenericConfigObject;
  outputer?: string | TangOutputer;
  outputOptions?: GenericConfigObject;
}

export interface TangCompiler {
  loaders: TangLoader[]; // 加载器
  defaultLoader: TangLoader; // 默认加载器

  parsers: TangParser[]; // 解析器
  defaultParser: TangParser; // 默认解析器

  generators: TangGenerator[]; // 生成器
  defaultGenerator: TangGenerator; // 默认生成器

  outputers: TangOutputer[]; // 输出器
  defaultOutputer: TangOutputer; /// 默认输出器

  load: (
    entry: string,
    options?: TangCompilerLoadOptions,
  ) => Promise<TangCompilation>;

  generate: (
    document: TangDocument,
    options?: TangCompilerGenerateOptions,
  ) => Promise<TangOutput>;
}

// Tang内置钩子函数
export interface TangHooks {
  // 加载开始
  load: TangHookFunction;

  // 解析开始
  parse: TangHookFunction;

  // 加载结束
  loaded: TangHookFunction;

  // 生成开始
  generate: TangHookFunction;

  // 输出开始
  output: TangHookFunction;

  // 生成结束
  generated: TangHookFunction;
}

export type TangHookNames = keyof TangHooks;

// 并行执行的钩子
export type TangParallelHookNames = 'generated';

// 顺序执行的钩子
export type TangSequentialHookNames = Exclude<TangHookNames, TangParallelHookNames>;

// 钩子方法
export type TangHookFunction = (
  context: TangHookContext,
  ...args: any[]
) => Promise<unknown | void> | unknown | void;

// 钩子执行上下文
export interface TangHookContext {
  compiler?: TangCompiler;

  loader?: TangLoader;
  parser?: TangParser;
  generator?: TangGenerator;
  outputer?: TangOutputer;

  document?: TangDocument;
  compilation?: TangCompilation;
  generation?: TangGeneration;
  output?: TangOutput;

  [key: string]: unknown;
}

// 钩子
export interface TangHook {
  name?: string;
  trigger?: TangHookNames | '*' | TangHookNames[]; //触发钩子执行
  pluginName?: string; // 钩子所属插件
  priority?: number; // 处理器优先级
  apply?: TangHookFunction;
}

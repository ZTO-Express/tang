import {
  TangGenerator,
  TangLoader,
  TangOutput,
  TangOutputer,
  TangParser,
} from './tang.processor';
import { TangDocument } from './tang.document';
import { GenericConfigObject } from './type';

/** 编译许选项 */
export interface TangCompileOptions {
  skipLoad?: boolean; // 编译时跳过加载

  skipParse?: boolean; // 编译时跳过解析

  skipGenerate?: boolean; // 编译时跳过生成

  skipOutput?: boolean; // 编译时跳过输出
}

export interface TangCompilation {
  entry: string;
  document?: TangDocument;
  compiler?: TangCompiler;

  loader?: TangLoader;
  parser?: TangParser;
  generator?: TangGenerator;
  outputer?: TangOutputer;

  output?: TangOutput;

  [key: string]: unknown;
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

  compileOptions: TangCompileOptions; // 编译器选项

  load: (
    entry: string,
    options?: TangCompilerLoadOptions,
  ) => Promise<TangCompilation>;

  generate: (
    document: TangDocument,
    options?: TangCompilerGenerateOptions,
    compilation?: TangCompilation,
  ) => Promise<TangCompilation>;
}

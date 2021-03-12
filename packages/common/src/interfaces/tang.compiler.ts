import {
  TangGenerator,
  TangLoader,
  TangOutput,
  TangOutputer,
  TangParser,
} from './tang.processor';
import { Document } from './document';
import { GenericConfigObject } from './type';

export interface TangCompilation {
  compiler: TangCompiler;
  document: Document;
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
    document: Document,
    options?: TangCompilerGenerateOptions,
  ) => Promise<TangOutput>;
}

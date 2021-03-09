import {
  TangCompilation,
  TangCompiler,
  TangDocument,
  TangLoader,
  TangParser,
} from '../@types';

/** 编译实例选项 */
export interface CompilationOptions {
  loader: TangLoader;
  parser: TangParser;
  document: TangDocument;
}

/**
 * 由Compiler加载文档后产生
 */
export class Compilation implements TangCompilation {
  compiler: TangCompiler;
  document: TangDocument;
  loader: TangLoader;
  parser: TangParser;

  constructor(compiler: TangCompiler, options: CompilationOptions) {
    this.compiler = compiler;
    this.document = options.document;
    this.loader = options.loader;
    this.parser = options.parser;
  }
}

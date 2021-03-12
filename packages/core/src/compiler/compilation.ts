import {
  Document,
  TangCompilation,
  TangCompiler,
  TangLoader,
  TangParser,
} from '@tang/common';

/** 编译实例选项 */
export interface CompilationOptions {
  loader: TangLoader;
  parser: TangParser;
  document: Document;
}

/**
 * 由Compiler加载文档后产生
 */
export class Compilation implements TangCompilation {
  compiler: TangCompiler;
  document: Document;
  loader: TangLoader;
  parser: TangParser;

  constructor(compiler: TangCompiler, options: CompilationOptions) {
    this.compiler = compiler;
    this.document = options.document;
    this.loader = options.loader;
    this.parser = options.parser;
  }
}

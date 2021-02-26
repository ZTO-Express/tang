import {
  TangDocument,
  TangDocumentLoader,
  TangDocumentParser,
} from '../common/types';
import { Compiler } from './Compiler';

/** 编译实例选项 */
export interface CompilationOptions {
  loader: TangDocumentLoader;
  parser: TangDocumentParser;
  document: TangDocument;
}

/**
 * 由Compiler加载文档后产生
 */
export class Compilation {
  compiler: Compiler;
  document: TangDocument;
  loader: TangDocumentLoader;
  parser: TangDocumentParser;

  constructor(compiler: Compiler, options: CompilationOptions) {
    this.compiler = compiler;
    this.document = options.document;
    this.loader = options.loader;
    this.parser = options.parser;
  }
}

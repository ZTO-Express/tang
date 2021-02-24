import { Document } from '../tang/types';
import { Compiler } from './Compiler';

/**
 * 由Compiler加载文档后产生
 */
export class Compilation {
  constructor(readonly compiler: Compiler, readonly document: Document) {}
}

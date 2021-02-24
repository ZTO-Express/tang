import { Document } from '../tang/types';
import { Generator } from './Generator';

/**
 * 由Generator加载文档后产生
 */
export class Generation {
  constructor(readonly generator: Generator, readonly document: Document) {}
}

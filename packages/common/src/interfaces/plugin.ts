import { Hook } from './hook';
import { GenericFunction } from './type';

export interface Plugin<T = any> {
  name: string;
  version?: string;
  description?: string;
  hooks?: Hook<T>[];
  actions?: Record<string, GenericFunction>;
  [prop: string]: any;
}

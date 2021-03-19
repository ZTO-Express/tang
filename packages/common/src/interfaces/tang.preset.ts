import { TangHook } from './tang.hook';
import { TangProcessor } from './tang.processor';

export interface TangPreset {
  name: string;
  version: string;
  processors?: TangProcessor[];
  hooks?: TangHook[];
  [prop: string]: any;
}

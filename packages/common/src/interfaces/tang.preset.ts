import { TangHook } from './tang.hook';
import {
  TangGenerator,
  TangLoader,
  TangOutput,
  TangParser,
} from './tang.processor';

export interface TangPreset {
  name: string;
  version?: string;
  loaders?: TangLoader[];
  parsers?: TangParser[];
  generators?: TangGenerator[];
  outputers?: TangOutput[];
  hooks?: TangHook[];
  [prop: string]: any;
}

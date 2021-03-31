import { TangHook } from './tang.hook';
import {
  TangGenerator,
  TangLoader,
  TangOutputer,
  TangParser,
} from './tang.processor';

export interface TangPresetOptions {
  defaultLoader?: string | TangLoader;
  loaders?: TangLoader[];

  defaultParser?: string | TangParser;
  parsers?: TangParser[];

  defaultGenerator?: string | TangGenerator;
  generators?: TangGenerator[];

  defaultOutputer?: string | TangOutputer;
  outputers?: TangOutputer[];

  hooks?: TangHook[];
}

export interface TangPreset extends TangPresetOptions {
  name: string;
  version?: string;
  description?: string;
  [prop: string]: any;
}

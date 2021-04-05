import { TangHook } from './tang.hook';
import {
  TangGenerator,
  TangLoader,
  TangOutputer,
  TangParser,
} from './tang.processor';

import { TangCompileOptions } from './tang.compiler';

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

  mergeDefaultPreset?: boolean; // 加载预设时是否合并默认预设

  compileOptions?: TangCompileOptions; // 编译选项
}

export interface TangPreset extends TangPresetOptions {
  name: string;
  version?: string;
  description?: string;
  [prop: string]: any;
}

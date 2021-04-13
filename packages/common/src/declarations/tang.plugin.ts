import { GenericObject } from './type';
import { Plugin } from './plugin';
import { TangCompilation } from './tang.compiler';
import { TangPreset, TangPresetOptions } from './tang.preset';
import {
  StrictTangGenerator,
  StrictTangLoader,
  StrictTangOutputer,
  StrictTangParser,
  StrictTangProcessor,
  TangGenerator,
  TangLoader,
  TangOutputer,
  TangParser,
} from './tang.processor';

export interface TangPlugin extends Plugin<TangCompilation> {
  preset?: TangPreset;
  presets?: TangPreset[];
}

type TangPluginProcessorOmitKeys = 'moduleType' | 'code' | 'type';

// 插件处理器类型
export interface TangPluginProcessor
  extends Omit<StrictTangProcessor, TangPluginProcessorOmitKeys>,
    GenericObject {}

// 插件文档加载器
export interface TangPluginLoader
  extends Omit<StrictTangLoader, TangPluginProcessorOmitKeys>,
    GenericObject {}

// 插件文档解析器
export interface TangPluginParser
  extends Omit<StrictTangParser, TangPluginProcessorOmitKeys>,
    GenericObject {}

// 插件文档生成器
export interface TangPluginGenerator
  extends Omit<StrictTangGenerator, TangPluginProcessorOmitKeys>,
    GenericObject {}

// 插件文档输出器
export interface TangPluginOutputer
  extends Omit<StrictTangOutputer, TangPluginProcessorOmitKeys>,
    GenericObject {}

export interface TangPluginPresetOptions
  extends Omit<
    TangPresetOptions,
    | 'defaultLoader'
    | 'loaders'
    | 'defaultParser'
    | 'parsers'
    | 'defaultGenerator'
    | 'generators'
    | 'defaultOutputer'
    | 'outputers'
  > {
  defaultLoader?: string | TangPluginLoader | TangLoader;
  loaders?: TangPluginLoader[] | TangLoader[];

  defaultParser?: string | TangPluginParser | TangParser;
  parsers?: TangPluginParser[] | TangParser[];

  defaultGenerator?: string | TangPluginGenerator | TangGenerator;
  generators?: TangPluginGenerator[] | TangGenerator[];

  defaultOutputer?: string | TangPluginOutputer | TangOutputer;
  outputers?: TangPluginOutputer[] | TangOutputer[];
}

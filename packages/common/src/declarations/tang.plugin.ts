import { Plugin } from './plugin';
import { TangCompilation } from './tang.compiler';
import { TangPreset } from './tang.preset';
import {
  TangGenerator,
  TangLoader,
  TangOutputer,
  TangParser,
  TangProcessor,
} from './tang.processor';

export interface TangPlugin extends Plugin<TangCompilation> {
  preset?: TangPreset;
  presets?: TangPreset[];
}

type TangPluginProcessorOmitKeys = 'moduleType' | 'code' | 'type';

// 插件处理器类型
export type TangPluginProcessor = Omit<
  TangProcessor,
  TangPluginProcessorOmitKeys
>;

// 插件文档加载器
export type TangPluginLoader = Omit<TangLoader, TangPluginProcessorOmitKeys>;

// 插件文档解析器
export type TangPluginParser = Omit<TangParser, TangPluginProcessorOmitKeys>;

// 插件文档生成器
export type TangPluginGenerator = Omit<
  TangGenerator,
  TangPluginProcessorOmitKeys
>;

// 插件文档输出器
export type TangPluginOutputer = Omit<
  TangOutputer,
  TangPluginProcessorOmitKeys
>;

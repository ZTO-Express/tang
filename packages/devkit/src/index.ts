import * as _common from '@devs-tang/common';

export * from './utils';

export * from './launch';
export * from './config';
export * from './plugin';
export * from './processors';
export * from './runners';
export * from './io';

export const errors = { ..._common.errors };
export const HookDriver = _common.HookDriver;

/** 导出插件开发相关定义 */
export {
  ErrorCodes as CommonErrorCodes,
  GenericObject,
  GenericConfigObject,
  GenericFunction,
  TangCompilation,
  TangDocument,
  TangDocumentModel,
  TangChunk,
  TangOutput,
  TangPreset,
  TangPresetOptions,
  TangHookFunction,
  TangHooks,
  TangHookNames,
  TangPlugin,
  TangPluginProcessor,
  TangPluginLoader,
  TangPluginParser,
  TangPluginGenerator,
  TangPluginOutputer,
  TangPluginPresetOptions,
} from '@devs-tang/common';

export {
  createDefaultCompiler,
  DefaultTangCompiler,
  getPresetConfigData,
} from '@devs-tang/core';

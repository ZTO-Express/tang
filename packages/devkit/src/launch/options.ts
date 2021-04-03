import { TangPreset, TangModuleTypes } from '@devs-tang/common';
import {
  mergeOptions,
  getNormalizedOptions as getCoreNormalizedOptions,
  normalizePresetOptions,
  NormalizedTangOptions,
} from '@devs-tang/core';

import { TANG_DEVKIT_PLUGIN_NAME } from '../consts';
import * as processors from '../processors';

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function mergePresetAndOptions(
  preset: TangPreset,
  options: NormalizedTangOptions = {},
) {
  let opts = mergePresetOptions(preset, options);
  opts = getNormalizedOptions(opts);
  return opts;
}

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function getNormalizedOptions(options?: NormalizedTangOptions) {
  const defaultProcessors = normalizePresetOptions(
    {
      loaders: [processors.docLoader()],
      parsers: [processors.json5Parser(), processors.yamlParser()],
      generators: [processors.yamlGenerator()],
      outputers: [processors.localOutputer(), processors.memoryOutputer()],
    },
    { moduleType: TangModuleTypes.devkit },
  );

  let opts = mergePresetOptions(defaultProcessors, options);

  opts = getCoreNormalizedOptions(opts);

  return opts;
}

/**
 * 合并预设选项
 * @param targetOptions
 * @param sourceOptions
 * @returns
 */
export function mergePresetOptions(
  targetOptions: NormalizedTangOptions,
  sourceOptions: NormalizedTangOptions,
) {
  const opts = mergeOptions(targetOptions, sourceOptions);
  return opts;
}

import { TangPreset, TangModuleTypes } from '@devs-tang/common';
import {
  mergeOptions,
  getNormalizedOptions as getCoreNormalizedOptions,
  normalizePresetOptions,
  NormalizedTangOptions,
  UnnormalizedTangOptions,
  PresetNormalizeOptions,
} from '@devs-tang/core';

import * as processors from '../processors';

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function getNormalizedOptions(
  tangOptions?: UnnormalizedTangOptions,
  options?: PresetNormalizeOptions,
) {
  const defaultProcessors = normalizePresetOptions(
    {
      loaders: [processors.docLoader()],
      parsers: [processors.json5Parser(), processors.yamlParser()],
      generators: [processors.codeGenerator(), processors.yamlGenerator()],
      outputers: [processors.localOutputer(), processors.memoryOutputer()],
    },
    { moduleType: TangModuleTypes.devkit },
  );

  const normalizedOptions = normalizePresetOptions(tangOptions, options);

  let opts = mergePresetOptions(defaultProcessors, normalizedOptions);

  opts = getCoreNormalizedOptions(opts);

  return opts;
}

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

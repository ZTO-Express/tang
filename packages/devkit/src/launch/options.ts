import { GenericConfigObject, TangPreset } from '@devs-tang/common';
import { mergeOptions } from '@devs-tang/core';
import * as processors from '../processors';

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function mergePresetOptions(
  preset: TangPreset,
  options?: GenericConfigObject,
) {
  const defaultProcessors = {
    loaders: [processors.docLoader()],
    parsers: [processors.json5Parser(), processors.yamlParser()],
    generators: [processors.yamlGenerator()],
    outputers: [processors.localOutputer(), processors.memoryOutputer()],
  };

  let opts = mergeOptions(defaultProcessors, preset);

  if (options) {
    opts = mergeOptions(opts, options);
  }

  return opts;
}

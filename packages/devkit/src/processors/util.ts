import { TangModuleTypes, TangPluginProcessor } from '@devs-tang/common';
import { normalizeProcessor, ProcessorNormalizeOptions } from '@devs-tang/core';

/**
 * 规范化开发包处理器
 * @param processor
 * @param options
 * @returns
 */
export function normalizeDevkitProcessor<T>(
  processor: TangPluginProcessor,
  options: ProcessorNormalizeOptions = {},
) {
  options.moduleType = TangModuleTypes.devkit;
  return (normalizeProcessor(processor, options) as any) as T;
}

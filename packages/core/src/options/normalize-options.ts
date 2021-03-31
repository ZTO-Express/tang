import {
  TangProcessor,
  TangProcessorTypes,
  TangProcessorTypeNames,
  TangProcessorsTypeKeys,
  TangPresetOptions,
  utils,
  GenericConfigObject,
  TangPreset,
} from '@devs-tang/common';

import { TANG_CORE_PLUGIN_NAME } from '../consts';
import { CompilerOptions } from '../compiler';
import * as processors from '../processors';

export type NormalizedTangOptions = CompilerOptions;

export interface NormalizeOptions {
  pluginName?: string;
  type?: TangProcessorTypeNames;
}

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function getNormalizedOptions(options?: NormalizedTangOptions) {
  const defaultProcessors = normalizePresetOptions(
    {
      loaders: [processors.urlLoader()],
      parsers: [processors.jsonParser()],
      generators: [processors.jsonGenerator()],
      outputers: [processors.consoleOutputer()],
    },
    {
      pluginName: TANG_CORE_PLUGIN_NAME,
    },
  );

  const opts = mergeOptions(defaultProcessors, options);

  return opts;
}

/**
 * 规范化预设选项
 * @param presetOptions
 * @param options
 * @returns
 */
export function normalizePresetOptions(
  presetOptions: TangPresetOptions,
  options: NormalizeOptions = {},
) {
  if (!presetOptions) return presetOptions;

  // 合并处理器选项
  for (const typeKey in TangProcessorTypes) {
    const typeKeysName = typeKey + 's';
    const processors = (presetOptions as any)[typeKeysName] || [];

    processors.forEach((it: TangProcessor) => {
      normalizeProcessor(it, options);
    });
  }

  return presetOptions;
}

export function normalizeProcessor(
  processor: TangProcessor,
  options: NormalizeOptions = {},
) {
  if (!processor) return processor;

  if (!processor.pluginName && options.pluginName) {
    processor.pluginName = options.pluginName;
  }

  if (!processor.code && processor.pluginName) {
    processor.code = `${processor.pluginName}:${processor.type}:${processor.name}`;
  }

  return processor;
}

export function mergeOptions(
  targetOptions: NormalizedTangOptions,
  sourceOptions: NormalizedTangOptions,
) {
  sourceOptions = sourceOptions || {};

  const sourcePlainOptions: any = {};
  const sourceProcessors: Record<string, TangProcessor> = {};

  // 拆分普通选项和处理器选项
  for (const key in sourceOptions) {
    if (TangProcessorsTypeKeys.includes(key)) {
      sourceProcessors[key] = sourceOptions[key];
    } else {
      sourcePlainOptions[key] = sourceOptions[key];
    }
  }

  // 合并普通选项
  const options = utils.deepMerge(
    targetOptions,
    sourcePlainOptions,
  ) as NormalizedTangOptions;

  // 合并处理器选项
  for (const type in TangProcessorTypes) {
    mergeProcessors(type as TangProcessorTypeNames, options, sourceProcessors);
  }

  return options;
}

/**
 * 合并处理器，规则：
 *  - 要求源处理器与目标处理器类型一致
 *  - 名称相同的处理器则使用当前处理器替换掉目标处理器
 *  - 名称不同的处理器则将源处理器优先排在前列
 *  - 返回结果为全新数组
 * @param processors 目标处理器
 * @param config 配置文件
 */
export function mergeProcessors(
  type: TangProcessorTypeNames,
  targetOptions: NormalizedTangOptions,
  sourceOptions: NormalizedTangOptions,
) {
  const typeKey = `${type}s`;

  targetOptions = targetOptions || {};
  sourceOptions = sourceOptions || {};

  let target = (targetOptions[typeKey] || []) as TangProcessor[];
  let source = (sourceOptions[typeKey] || []) as TangProcessor[];

  source = source.filter(it => it && it.type === type);
  target = target
    .filter(it => it && it.type === type)
    .filter(t => !source.find(s => t.name === s.name));

  targetOptions[typeKey] = [...source, ...target];

  return targetOptions;
}

/**
 * 获取预设选项
 * @param preset
 * @returns
 */
export function getPresetConfig(preset: TangPreset) {
  const _config = getPresetOptionsConfig(preset);

  if (!_config) return undefined;

  const config = utils.omit(
    {
      name: preset.name,
      version: preset.version,
      description: preset.description,
      ..._config,
    },
    it => !utils.isNil(it),
  );

  return config;
}

/**
 * 获取预设配置选项
 * @param presetOptions
 * @returns
 */
export function getPresetOptionsConfig(presetOptions: TangPresetOptions) {
  if (!presetOptions) return undefined;

  const config = utils.omit(
    {
      defaultLoader: getPresetProcessorConfig(presetOptions.defaultLoader),
      loaders: getPresetProcessorsConfigs(presetOptions.loaders),

      defaultParser: getPresetProcessorConfig(presetOptions.defaultParser),
      parsers: getPresetProcessorsConfigs(presetOptions.parsers),

      defaultGenerator: getPresetProcessorConfig(
        presetOptions.defaultGenerator,
      ),
      generators: getPresetProcessorsConfigs(presetOptions.generators),

      defaultOutputer: getPresetProcessorConfig(presetOptions.defaultOutputer),
      outputers: getPresetProcessorsConfigs(presetOptions.outputers),
    },
    it => !utils.isNil(it),
  );

  return config;
}

/**
 *
 * @param processors 获取多个处理器配置
 * @returns
 */
export function getPresetProcessorsConfigs(processors: TangProcessor[]) {
  const configs = (processors || []).map(it => getPresetProcessorConfig(it));
  return configs;
}

/**
 * 获取处理器配置
 * @param processor
 * @returns
 */
export function getPresetProcessorConfig(processor: TangProcessor | string) {
  let config: any = undefined;

  if (typeof processor === 'string') {
    config = processors.parseProcessorName(processor);
  } else if (processor) {
    normalizeProcessor(processor);

    config = utils.pick(
      processor,
      'name',
      'type',
      'pluginName',
      'code',
      'loadOptions',
      'parseOptions',
      'generateOptions',
      'outputOptions',
    );
  }

  return config;
}

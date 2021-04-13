import {
  TangProcessor,
  TangProcessorTypes,
  TangProcessorTypeNames,
  TangProcessorsTypeKeys,
  TangPresetOptions,
  TangPreset,
  TangPluginProcessor,
  TangModuleTypes,
  TangModuleTypeNames,
  InvalidProcessorError,
  GenericObject,
  TangPluginPresetOptions,
  utils,
} from '@devs-tang/common';

import { CompilerOptions } from '../compiler';
import * as processors from '../processors';

export type NormalizedTangOptions = CompilerOptions;

export interface PresetNormalizeOptions {
  moduleType?: TangModuleTypeNames;
  pluginName?: string;
}

export interface UnnormalizedTangOptions
  extends TangPluginPresetOptions,
    GenericObject {}

export interface ProcessorNormalizeOptions extends PresetNormalizeOptions {
  type?: TangProcessorTypeNames;
}

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
      loaders: [processors.urlLoader()],
      parsers: [processors.jsonParser()],
      generators: [processors.jsonGenerator()],
      outputers: [processors.consoleOutputer()],
    },
    {
      moduleType: TangModuleTypes.core,
    },
  );

  const normalizedOptions = normalizePresetOptions(tangOptions, options);

  const opts = mergeOptions(defaultProcessors, normalizedOptions);

  return opts;
}

/**
 * 规范化预设选项
 * @param presetOptions
 * @param options
 * @returns
 */
export function normalizePresetOptions(
  presetOptions: UnnormalizedTangOptions,
  options: PresetNormalizeOptions = {},
): NormalizedTangOptions {
  if (!presetOptions) return undefined;

  // 合并处理器选项
  for (const typeKey in TangProcessorTypes) {
    const typeKeysName = typeKey + 's';
    const processors = (presetOptions as any)[typeKeysName] || [];

    processors.forEach((it: TangPluginProcessor) => {
      normalizeProcessor(it, {
        type: typeKey as TangProcessorTypeNames,
        ...options,
      });
    });
  }

  return presetOptions as NormalizedTangOptions;
}

export function normalizeProcessor(
  processor: TangPluginProcessor,
  options: ProcessorNormalizeOptions = {},
): TangProcessor {
  if (!processor) return undefined;

  processor.moduleType = processor.moduleType || options.moduleType || 'plugin';
  processor.type = processor.type || options.type;
  processor.pluginName = processor.pluginName || options.pluginName;

  // 必须有处理器类型或名称
  if (!processor.type || !processor.name)
    throw new InvalidProcessorError('处理器预设必须提供名称和类型');

  // 插件类型必须有插件名称
  if (processor.moduleType === 'plugin' && !processor.pluginName)
    throw new InvalidProcessorError('插件处理器必须提供插件名称');

  if (!processor.code) {
    processor.code = processor.moduleType + ':';

    if (processor.moduleType === 'plugin') {
      processor.code += processor.pluginName + ':';
    }

    processor.code += `${processor.type}:${processor.name}`;
  }

  processor = utils.omitNil(processor);

  return (processor as any) as TangProcessor;
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
export function getPresetConfigData(preset: TangPreset) {
  const _config = getPresetOptionsConfigData(preset);

  if (!_config) return undefined;

  const config = utils.omitNil({
    name: preset.name,
    version: preset.version,
    description: preset.description,
    ..._config,
  });

  return config;
}

/**
 * 获取预设配置选项
 * @param presetOptions
 * @returns
 */
export function getPresetOptionsConfigData(presetOptions: TangPresetOptions) {
  if (!presetOptions) return undefined;

  const config = utils.omitNil({
    defaultLoader: getPresetProcessorConfigData(presetOptions.defaultLoader),
    loaders: getPresetProcessorsConfigsData(presetOptions.loaders),

    defaultParser: getPresetProcessorConfigData(presetOptions.defaultParser),
    parsers: getPresetProcessorsConfigsData(presetOptions.parsers),

    defaultGenerator: getPresetProcessorConfigData(
      presetOptions.defaultGenerator,
    ),
    generators: getPresetProcessorsConfigsData(presetOptions.generators),

    defaultOutputer: getPresetProcessorConfigData(
      presetOptions.defaultOutputer,
    ),
    outputers: getPresetProcessorsConfigsData(presetOptions.outputers),
  });

  return config;
}

/**
 *
 * @param processors 获取多个处理器配置
 * @returns
 */
export function getPresetProcessorsConfigsData(processors: TangProcessor[]) {
  if (!processors || !processors.length) return undefined;

  const configs = processors.map(it => getPresetProcessorConfigData(it));
  return configs;
}

/**
 * 获取处理器配置
 * @param processor
 * @returns
 */
export function getPresetProcessorConfigData(
  processor: TangProcessor | string,
) {
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

import {
  GenericConfigObject,
  TangOutputer,
  TangProcessor,
  TangProcessorTypes,
  TangProcessorTypeNames,
  TangProcessorsTypeKeys,
  utils,
} from '@tang/common';

import { CompilerOptions } from '../compiler/compiler.interfaces';
import * as processors from '../processors';

export interface NormalizedTangOptions extends CompilerOptions {
  [prop: string]: unknown;
}

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function getNormalizedOptions(config: GenericConfigObject) {
  const defaultProcessors = {
    loaders: [processors.urlLoader(), processors.moduleLoader()],
    parsers: [processors.jsonParser()],
    generators: [processors.jsonGenerator()],
    outputers: [] as TangOutputer[],
  };

  const options = mergeOptions(defaultProcessors, config);

  return options;
}

export function mergeOptions(
  targetOptions: NormalizedTangOptions,
  sourceOptions: GenericConfigObject,
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
  sourceOptions: GenericConfigObject,
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

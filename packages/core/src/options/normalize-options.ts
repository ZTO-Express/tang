import {
  GenericConfigObject,
  TangOutputer,
  TangProcessor,
  TangProcessorTypeNames,
  TangProcessorTypes,
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
  const defaultOptions = {};

  const defaultProcessors = {
    loaders: [processors.urlLoader(), processors.moduleLoader()],
    parsers: [processors.jsonParser()],
    generators: [processors.jsonGenerator()],
    outputers: [] as TangOutputer[],
  };

  const options = utils.deepMerge(
    defaultOptions,
    config,
  ) as NormalizedTangOptions;

  // 先用默认处理器替换原处理器
  Object.assign(options, defaultProcessors);

  // 调用方法合并源处理器
  for (const type in TangProcessorTypes) {
    mergeProcessors(type as TangProcessorTypeNames, options, config);
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

  let target = (targetOptions[typeKey] || []) as TangProcessor[];
  let source = (sourceOptions[typeKey] || []) as TangProcessor[];

  source = source.filter(it => it && it.type === type);
  target = target
    .filter(it => it && it.type === type)
    .filter(t => !source.find(s => t.name === s.name));

  targetOptions[typeKey] = [...source, ...target];

  return targetOptions;
}

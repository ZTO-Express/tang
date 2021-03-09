import {
  GenericConfigObject,
  NormalizedTangOptions,
  TangProcessor,
  TangProcessorTypes,
} from '../@types';

import { deepMerge } from '../utils';
import * as loader from '../loader';
import * as parser from '../parser';
import * as generator from '../generator';
import * as outputer from '../outputer';

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function getNormalizedOptions(config: GenericConfigObject) {
  const defaultOptions = {
    loaders: [loader.localLoader(), loader.urlLoader()],
    parsers: [parser.jsonParser(), parser.yamlParser()],
    generators: [generator.jsonGenerator(), generator.yamlGenerator()],
    outputers: [outputer.localOutputer(), outputer.memoryOutputer()],
  };

  const options = deepMerge(defaultOptions, config) as NormalizedTangOptions;

  mergeProcessors('loader', options, config);
  mergeProcessors('parser', options, config);
  mergeProcessors('generator', options, config);
  mergeProcessors('outputer', options, config);

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
  type: TangProcessorTypes,
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

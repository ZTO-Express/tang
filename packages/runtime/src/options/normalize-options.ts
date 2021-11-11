import { _ } from '../utils'
import { defaultOptions } from './defaults'

import type { AppOptions, NormalizedAppOptions } from '../typings'

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function getNormalizedOptions(options?: AppOptions): NormalizedAppOptions {
  // 设置全局配置
  const opts = mergeAppOptions(defaultOptions(), options)

  return opts
}

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function mergeAppOptions(
  targetOptions: Partial<AppOptions>,
  sourceOptions?: AppOptions
): NormalizedAppOptions {
  // 设置全局配置
  const opts = _.deepMerge(targetOptions, sourceOptions)

  return opts
}

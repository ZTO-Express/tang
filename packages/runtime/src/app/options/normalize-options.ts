import { _ } from '../../utils'
import { defaultOptions } from './defaults'

import type { AppOptions, NormalizedAppOptions } from '../../typings'

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function getNormalizedOptions(options?: AppOptions): NormalizedAppOptions {
  // 设置全局配置
  const opts = mergeAppOptions(defaultOptions(), options)

  const keepAlive = _.get(opts, 'app.page.keepAlive')
  const showNav = _.get(opts, 'app.menu.showNav')
  const frame = _.get(opts, 'app.frame')

  // 如果keepAlive未设置
  if (_.isNil(keepAlive)) {
    // 如果noFrame不为true, 并且showNav为true，则设置keepAlive为true
    if (frame !== false && showNav === true) {
      _.set(opts, 'app.page.keepAlive', true)
    }
  }

  // 如果frame为false，则showNav永远为false
  if (frame === false) {
    _.set(opts, 'app.menu.showNav', false)
  }

  return opts
}

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function mergeAppOptions(targetOptions: Partial<AppOptions>, sourceOptions?: AppOptions): NormalizedAppOptions {
  // 浏览器状态下ui无法深度merge编译有可能导致死循环，这里先把ui拿出来
  const ui = sourceOptions?.ui
  const _sourceOptions = _.omit(sourceOptions, 'ui')

  // 设置全局配置
  const opts = _.deepMerge(targetOptions, _sourceOptions)
  opts.ui = ui

  return opts
}

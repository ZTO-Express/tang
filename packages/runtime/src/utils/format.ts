import { _ } from '../utils'
import * as formatter from './formatter'

import type { FormatTextOptions } from '../typings'

/** 通过内置格式化方法进行格式化 */
export function formatText(val: any, f: string | Function | Record<string, any>, options?: FormatTextOptions) {
  if (!f) return val

  const exFormatters = options?.formatters || {}

  const allFormatters: any = { ...formatter, ...exFormatters }

  if (_.isString(f)) {
    f = allFormatters[f]
  } else if (_.isObject(f)) {
    f = allFormatters[f.name]

    const _options = (f as any).options

    if (!options) {
      options = _options
    } else if (_.isObject(_options) && _.isObject(options)) {
      options = { ..._options, ...options }
    }
  }

  let valText = String(val)
  if (typeof f === 'function') valText = f(val, options)
  return valText
}

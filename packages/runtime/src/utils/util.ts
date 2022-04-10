import qs from 'qs'
import { _, noop, strings } from '@zto/zpage-core'
import { getPageKey, uniqId, guid, uuid } from './helper'
import { warn } from './debug'
import * as formatter from './formatter'

export { _, strings, noop, getPageKey, warn, qs, uniqId, guid, uuid }

/** 空字符串替换 */
export function filterEmpty(val: any, replaceText = '--') {
  if (!val && val !== 0) return replaceText
  return val
}

/** 通过内置格式化方法进行格式化 */
export function formatText(val: any, name: string, options?: any) {
  const f = (formatter as any)[name]

  let valText = String(val)
  if (typeof f === 'function') valText = f(val, options)
  return valText
}

/** 判读字符串是否url */
export function isHttpUrl(str: string) {
  if (!str) return false
  return str.startsWith('https://') || str.startsWith('http://') || str.startsWith('//')
}

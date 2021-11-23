import qs from 'qs'
import { _, noop } from '@zto/zpage-core'
import { getPageKey, uniqId, guid, uuid } from './helper'
import { warn } from './debug'

export { _, noop, getPageKey, warn, qs, uniqId, guid, uuid }

/** 空字符串替换 */
export function filterEmpty(val: any, replaceText = '--') {
  if (!val && val !== 0) return replaceText
  return val
}

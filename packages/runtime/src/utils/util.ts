import qs from 'qs'
import { nextTick } from 'vue'
import { getPageKey, uniqId, guid, uuid } from './helper'
import { warn } from './debug'

export {
  noop,
  _,
  strings,
  isBoolean,
  isEmpty,
  isEmptyArray,
  isEmptyObject,
  isFunction,
  isNil,
  isNull,
  isObject,
  isPlainObject,
  isPromise,
  isString,
  isSymbol,
  isUndefined
} from '@zto/zpage-core'

export { qs }
export { nextTick }
export { getPageKey, uniqId, guid, uuid }
export { warn }

/** 空字符串替换 */
export function filterEmpty(val: any, replaceText = '--') {
  if (!val && val !== 0) return replaceText
  return val
}

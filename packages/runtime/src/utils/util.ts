import _qs from 'qs'
import { nextTick, camelize, capitalize } from 'vue'
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
  isUndefined,
  throttle,
  debound
} from '@zto/zpage-core'

export const qs = _qs
export { nextTick, camelize, capitalize }
export { getPageKey, uniqId, guid, uuid }
export { warn }

/** 空字符串替换 */
export function filterEmpty(val: any, replaceText = '--') {
  if (!val && val !== 0) return replaceText
  return val
}

/** 获取Vue组件 */
export function resolveVueAsset(registry: Record<string, any> | undefined, name: string) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))])
}

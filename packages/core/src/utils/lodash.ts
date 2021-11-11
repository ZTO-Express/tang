import { baseGet, baseSet, baseUnset, last } from './_internal'
import { deepmergeAll } from './_internal/deepmerge'

import type { DeepmergeOptions } from './_internal/deepmerge'

/** 获取对象tag */
export function getTag(value: unknown): string {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }
  return toString.call(value)
}

// 是否Boolean类型
export const isBoolean = (o: unknown): boolean => getTag(o) === '[object Boolean]'

// 目标是否为null
export const isNull = (o: unknown): boolean => getTag(o) === '[object Null]'

// 目标是否为undefined
export const isUndefined = (o: unknown): boolean => getTag(o) === '[object Undefined]'

// 目标为null or undefined
export const isNil = (o: unknown): boolean => isNull(o) || isUndefined(o)

// 目标是否对象
export const isObject = (fn: unknown): boolean => !isNil(fn) && typeof fn === 'object'

// 数组是否为空
export const isEmptyArray = (o: unknown): boolean => Array.isArray(o) && !o.length

// 是否为空对象 如：{}, new Object()
export const isEmptyObject = (o: any): boolean =>
  isObject(o) && Object.keys(o).length === 0 && o.constructor === Object

/**
 * 判断目标是否为空
 * @param o
 * @param options
 *  zero: 0为空
 *  blank: 空字符串为空
 * @returns
 */
export const isEmpty = (
  o: unknown,
  options: {
    blank?: boolean // 默认为true
    zero?: boolean // 默认为false
    zeroStr?: boolean // 默认为false
    trimBlank?: boolean // 默认为false
    emptyArray?: boolean // 默认为false
    emptyObject?: boolean // 默认为false
  } = {}
): boolean => {
  return (
    isNil(o) ||
    (options.blank !== false && o === '') ||
    (options.zero === true && o === 0) ||
    (options.zeroStr === true && o === '0') ||
    (options.trimBlank === true && String(o).trim() === '') ||
    (options.emptyArray === true && isEmptyArray(o)) ||
    (options.emptyObject === true && isEmptyObject(o))
  )
}

// 是否为function
export const isFunction = (o: unknown): boolean => typeof o === 'function'

// 是否为Promise对象
export const isPromise = (o: any): boolean => isObject(o) && isFunction(o.then)

// 是否String
export const isString = (o: unknown): o is string => typeof o === 'string'

// 是否Symbol
export const isSymbol = (o: unknown): o is symbol => typeof o === 'symbol'

// 目标是否普通对象
export const isPlainObject = (o: any): boolean => {
  if (!isObject(o)) return false

  // If has modified constructor
  const ctor = o.constructor
  if (ctor === undefined) return true

  // If has modified prototype
  const prot = ctor.prototype
  if (!isObject(prot)) return false

  // If constructor does not have an Object-specific method
  // eslint-disable-next-line no-prototype-builtins
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false
  }

  // Most likely a plain Object
  return true
}

/** 无操作 */
export const noop = (): void => {
  /** noop */
}

/** 返回数组最后一个元素 */
export const arryLast = last

/**
 * 返回数组
 * @param items 为数组返回原值，为空则空数组，否则返回目标为唯一项的数组
 */
export function ensureArray<T>(items: Array<T | null | undefined> | T | null | undefined): T[] {
  if (Array.isArray(items)) {
    return items.filter(Boolean) as T[]
  }
  if (items || (typeof items === 'number' && items === 0)) {
    return [items]
  }
  return []
}

/**
 * 查找目标key
 */
export function findBy<T = unknown>(
  items: T[] | undefined | null,
  key: string,
  val: unknown
): T | undefined {
  if (!items || !items.length) return undefined

  const result = items.find(item => {
    if (!item) return false
    return (item as any)[key] === val
  })

  return result
}

/**
 * 根据目标key进行排序，排序将产生新的数组
 */
export function sortBy<T = unknown>(
  items: unknown[] | undefined | null,
  sortKey: string,
  options?: number | { sortOrder?: number | null; defaultValue?: unknown }
): T[] {
  if (!items || !items.length) return []

  let opts: any = { sortOrder: 1, defaultValue: undefined }

  if (typeof options === 'number') {
    opts = { sortOrder: options }
  } else {
    opts = Object.assign(opts, options)
  }

  const sortOrder = opts.sortOrder || 1
  const defaultValue = opts.defaultValue

  const _items = [...items]

  _items.sort((a: any, b: any) => {
    const av = !a || a[sortKey] === undefined ? defaultValue : a[sortKey]
    const bv = !b || b[sortKey] === undefined ? defaultValue : b[sortKey]

    if (av === bv) return 0
    if (!av) return -1 * sortOrder // 升序时，不存在则默认往后拍，降序相反
    if (!bv) return 1 * sortOrder // 同上
    return (av > bv ? 1 : -1) * sortOrder
  })

  return _items as T[]
}

/**
 * 浅度比较对象是否相等
 * @param obj1
 * @param obj2
 * @returns
 */
export function equal(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true
  if (!obj1 || !obj2) return false

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}

/**
 * 深度比较两个对象是否相等
 * @param obj1
 * @param obj2
 * @returns
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true
  if (!obj1 || !obj2) return false

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    const val1 = obj1[key]
    const val2 = obj2[key]
    const areObjects = isObject(val1) && isObject(val2)
    if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
      return false
    }
  }

  return true
}

/** 深度克隆，并支持循环应用 */
export function deepClone(obj: any, cache: any[] = []): any {
  if (!obj || typeof obj !== 'object') return obj

  // 处理日期
  if (obj instanceof Date) {
    const dt = new Date()
    dt.setTime(obj.getTime())
    return dt
  }

  // 如果obj命中，则当前为循环引用
  const hit = cache.find(c => c.original === obj)
  if (hit) return hit.copy

  const copy: any = Array.isArray(obj) ? [] : {}

  // 将copy放入缓存以备后续检查循环引用
  cache.push({ original: obj, copy })

  Object.keys(obj).forEach(key => {
    copy[key] = deepClone(obj[key], cache)
  })

  return copy
}

/**
 * 深度合并，合并后会产生新的对象，排序靠后的会合并考前的对象
 * @param args 被和并的对象
 */
export function deepMerge(...args: any[]): any {
  const items = args.filter(it => !isNil(it))
  return deepmergeAll(items, {
    isMergeableObject: isPlainObject
  })
}

/**
 * 深度合并，合并后会产生新的对象，排序靠后的会合并考前的对象
 * @param args 被和并的对象，合并对象数组
 * @param options 支持合并选项
 */
export function deepMerge2(args: any[], options?: DeepmergeOptions): any {
  const items = args.filter(it => !isNil(it))

  const opts = Object.assign(
    {
      isMergeableObject: isPlainObject
    },
    options
  )
  return deepmergeAll(items, opts)
}

/** 深度冻结对象（对象内部任何内容不能改变） */
export function deepFreeze(object: any) {
  Object.freeze(object)

  for (const value of Object.values(object)) {
    if (typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  }

  return object
}

/** 获取指定路径对象值 */
export function get(object: unknown, path: string | string[], defaultValue?: unknown) {
  const result = object == null ? undefined : baseGet(object, path)
  return result === undefined ? defaultValue : result
}

/** 设置指定对象路径值 */
export function set(
  object: unknown,
  path: string | string[],
  value: unknown,
  customizer?: GenericFunction
) {
  customizer = typeof customizer === 'function' ? customizer : undefined
  return object == null ? object : baseSet(object, path, value, customizer)
}

/** 移除对象指定路径值 */
export function unset(object: unknown, path: string | string[]) {
  return object == null ? true : baseUnset(object, path)
}

export type OmitFilterFn = (val: any, key: string, object: unknown) => boolean

/**
 * @param object 需要移除属性的对象
 * @param props 需要移除的属性
 * @param filter 过滤方法，返回true则保留，否则排除
 */
export function omit(
  object: any,
  props?: string | string[] | OmitFilterFn,
  filter?: OmitFilterFn
): any {
  if (typeof props === 'string') {
    props = [props]
  } else if (typeof props === 'function') {
    filter = props
    props = []
  }

  if (!isObject(object)) return {}

  const isFunction = typeof filter === 'function'
  const keys = Object.keys(object)
  const res: any = {}

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const val = object[key]

    if (!props || (!props.includes(key) && (!isFunction || filter?.(val, key, object)))) {
      res[key] = val
    }
  }
  return res
}

/**
 * 过滤对象所有为Nil的属性
 * @param object 需要移除属性的对象
 */
export function omitNil(object: unknown): any {
  return omit(object, val => !isNil(val))
}

/**
 * 过滤对象所有为Empty的属性
 * @param object 需要移除属性的对象
 */
export function omitEmpty(object: unknown): any {
  return omit(object, val => !isEmpty(val))
}

/**
 * 简单的从目标中选取指定选项生成新的对象
 * @param source
 * @param keys
 * @returns
 */
export function pick(source: any, ...keys: string[]): any {
  return keys.reduce((result: { [key: string]: any }, key) => {
    if (source[key] !== undefined) {
      result[key] = source[key]
    }

    return result
  }, {})
}

/**
 * 转换对象为可编译二维数组
 * @param obj
 * @returns
 */
export function entries<T>(obj: GenericObject<T>): Array<[string, T]> {
  return Object.keys(obj).map((key: string) => [key, obj[key]])
}

/**
 * 延时时间
 * @param seconds
 * @returns
 */
export async function delay<T>(fn: GenericFunction, seconds = 1): Promise<T> {
  return await new Promise((resolve, reject) => {
    setTimeout(() => {
      Promise.resolve()
        .then(() => {
          // eslint-disable-next-line no-useless-call
          return fn.call(undefined)
        })
        .then(result => {
          resolve(result as T)
        })
        .catch(err => {
          reject(err)
        })
    }, seconds)
  })
}

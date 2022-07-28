import { baseGet, baseSet, baseUnset, last } from './_internal'
import { deepmergeAll } from './_internal/deepmerge'
import { isObject, isString, isPlainObject, isNil, isEmpty } from './_internal/base'

import type { DeepmergeOptions } from './_internal/deepmerge'
import type { GenericFunction } from '../global'

/** 返回数组最后一个元素 */
export const arryLast = last

export * as base from './_internal/base'

export * from './_internal/base'

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
 * 将对象转换为数组，并将对象的key转换为
 * @param obj 目标对象
 * @param retriever 获取数组对象的方法
 * @returns
 */
export function objectToArray<T = any, E = any>(
  obj: Record<string, E>,
  retriever?: (item: E, key: string, obj: Record<string, E>) => T
): (T | undefined | null)[] {
  if (!obj) return []

  const items = Object.keys(obj).map(key => {
    let it: any = obj[key]
    if (retriever) {
      it = retriever(obj[key], key, obj)
    }

    return it
  })

  return items
}

/**
 * 数组转换为对象
 * @param arr 目标数组
 * @param keyProp 对象key
 * @returns
 */
export function arrayToObject<T = any>(arr: T[], keyProp: string): Record<string, T> {
  if (!arr?.length) return {}

  const obj: Record<string, T> = arr.reduce((pre: Record<string, T>, cur: T) => {
    if (cur) {
      const key: string = (cur as any)[keyProp]
      if (key) pre[key] = cur
    }

    return pre
  }, {})

  return obj
}

/**
 * 查找目标key
 */
export function findBy<T = unknown>(items: T[] | undefined | null, key: string, val: unknown): T | undefined {
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

/** 深度处理目标对象，支持循环引用，返回处理结果（新的对象） */
export function deepProcess(obj: any, fn: GenericFunction, cache: any[] = []): any {
  if (!obj || typeof obj !== 'object') return fn(obj)

  // 处理日期
  if (obj instanceof Date) {
    const dt = new Date()
    dt.setTime(obj.getTime())
    return fn(dt)
  }

  // 如果obj命中，则当前为循环引用
  const hit = cache.find(c => c.original === obj)
  if (hit) return hit.copy

  const copy: any = Array.isArray(obj) ? [] : {}

  // 将copy放入缓存以备后续检查循环引用
  cache.push({ original: obj, copy })

  Object.keys(obj).forEach(key => {
    copy[key] = deepProcess(obj[key], fn, cache)
  })

  return copy
}

/** 深度克隆，并支持循环引用 */
export function deepClone(obj: any): any {
  return deepProcess(obj, (val: any) => {
    return val
  })
}

/** 深度trim，并支持循环引用 */
export function deepTrim(obj: any): any {
  return deepProcess(obj, (val: any) => {
    if (isString(val)) return val.trim()
    return val
  })
}

/** 默认深度合并对象判断 */
export function isDeepMergeableObject(o: any): boolean {
  return Array.isArray(o) || isPlainObject(o)
}

/**
 * 深度合并，合并后会产生新的对象，排序靠后的会合并考前的对象
 * @param args 被和并的对象
 */
export function deepMerge(...args: any[]): any {
  const items = args.filter(it => !isNil(it))
  return deepmergeAll(items, {
    isMergeableObject: isDeepMergeableObject
  })
}

/**
 * 深度合并，合并后会产生新的对象，排序靠后的会合并考前的对象
 * @param args 被和并的对象，合并对象数组
 * @param options 支持合并选项
 */
export function deepMerge2(args: any[], options?: DeepmergeOptions): any {
  const items = args.filter(it => !isNil(it))

  const opts = {
    isMergeableObject: isDeepMergeableObject,
    ...options
  }

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
export function set(object: unknown, path: string | string[], value: unknown, customizer?: GenericFunction) {
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
export function omit(object: any, props?: string | string[] | OmitFilterFn, filter?: OmitFilterFn): any {
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
export function entries<T>(obj: Record<string, T>): Array<[string, T]> {
  return Object.keys(obj).map((key: string) => [key, obj[key]])
}

/**
 * 延时时间
 * @param seconds
 * @returns
 */
export async function delay<T>(fn: GenericFunction, milliseconds = 1): Promise<T> {
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
    }, milliseconds)
  })
}

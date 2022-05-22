/** 无操作 */
export const noop = (): void => {
  /** noop */
}

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
export const isEmptyObject = (o: any): boolean => isObject(o) && Object.keys(o).length === 0 && o.constructor === Object

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

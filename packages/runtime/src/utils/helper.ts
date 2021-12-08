/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable indent */
/* eslint-disable no-prototype-builtins */
import isPlainObject from 'lodash/isPlainObject'
import isEqual from 'lodash/isEqual'
import uniq from 'lodash/uniq'
import qs from 'qs'
import { simpleCompare } from './sort'
import { evalExpression } from './tpl'
import { isPureVariable, resolveVariable, resolveVariableAndFilter } from './tpl-builtin'

import type { GenericFunction } from '@zto/zpage-core'

export function isObject(obj: any) {
  const typename = typeof obj
  return (
    obj &&
    typename !== 'string' &&
    typename !== 'number' &&
    typename !== 'boolean' &&
    typename !== 'function' &&
    !Array.isArray(obj)
  )
}

// 判断对象是否为空
export function isEmpty(thing: any) {
  if (isObject(thing) && Object.keys(thing).length) {
    return false
  }

  return true
}

// 方便取值的时候能够把上层的取到，但是获取的时候不会全部把所有的数据获取到。
export function createObject(
  superProps?: { [propName: string]: any },
  props?: { [propName: string]: any },
  properties?: any
): object {
  if (superProps && Object.isFrozen(superProps)) {
    superProps = cloneObject(superProps)
  }

  const obj = superProps
    ? Object.create(superProps, {
        ...properties,
        __super: {
          value: superProps,
          writable: false,
          enumerable: false
        }
      })
    : Object.create(Object.prototype, properties)

  props && isObject(props) && Object.keys(props).forEach((key) => (obj[key] = props[key]))

  return obj
}

export function cloneObject(target: any, persistOwnProps = true) {
  const obj =
    target && target.__super
      ? Object.create(target.__super, {
          __super: {
            value: target.__super,
            writable: false,
            enumerable: false
          }
        })
      : Object.create(Object.prototype)
  persistOwnProps && target && Object.keys(target).forEach((key) => (obj[key] = target[key]))
  return obj
}

/**
 * 浅合并对象，并产生一个全新对象
 * @param target
 * @param src
 * @param persistOwnProps
 * @returns
 */
export function extendObject(target: any, src?: any, persistOwnProps = true) {
  const obj = cloneObject(target, persistOwnProps)
  src && Object.keys(src).forEach((key) => (obj[key] = src[key]))
  return obj
}

/** 遍历并返回处理所有对象下的值 */
export function mapObject(value: any, fn: GenericFunction): any {
  if (Array.isArray(value)) {
    return value.map((item) => mapObject(item, fn))
  }
  if (isObject(value)) {
    let tmpValue = { ...value }
    Object.keys(tmpValue).forEach((key) => {
      ;(tmpValue as Record<string, any>)[key] = mapObject((tmpValue as Record<string, any>)[key], fn)
    })
    return tmpValue
  }
  return fn(value)
}

/** 清理对象中所有undefined值 */
export function rmUndefined(obj: Record<string, any>) {
  const newObj: Record<string, any> = {}

  if (typeof obj !== 'object') {
    return obj
  }

  const keys = Object.keys(obj)
  keys.forEach((key) => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key]
    }
  })

  return newObj
}

/** 根据指定的字段排序 */
export function sortArray<T = any>(items: Array<T>, dir: -1 | 1 = 1, field?: string): Array<T> {
  return items.sort((a: any, b: any) => {
    let a1 = a
    let b1 = b

    if (field) {
      a1 = a[field]
      b1 = b[field]
    }

    const ret = simpleCompare(a1, b1, dir)
    return ret
  })
}

/** 数组中找到特定目标的下标 */
export function findIndex(arr: Array<any>, detect: (item?: any, index?: number) => boolean) {
  for (let i = 0, len = arr.length; i < len; i++) {
    if (detect(arr[i], i)) {
      return i
    }
  }

  return -1
}

/** 从数组中找到重复的对象 */
export function findRepeats(arr: Array<any>, compare: (item1?: any, item2?: any) => number = simpleCompare) {
  const sortedArr = arr.sort(compare)

  const repeats: any[] = []

  sortedArr.forEach((it, index) => {
    if (index === 0) return
    if (compare(it, sortedArr[index - 1]) === 0) {
      repeats.push(it)
    }
  })

  return repeats
}

export function promisify<T extends GenericFunction>(
  fn: T
): (...args: Array<any>) => Promise<any> & {
  raw: T
} {
  let promisified = function () {
    try {
      const ret = fn.apply(null, arguments as any)
      if (ret && ret.then) {
        return ret
      } else if (typeof ret === 'function') {
        // thunk support
        return new Promise((resolve, reject) =>
          ret((error: boolean, value: any) => (error ? reject(error) : resolve(value)))
        )
      }
      return Promise.resolve(ret)
    } catch (e) {
      return Promise.reject(e)
    }
  }
  ;(promisified as any).raw = fn
  return promisified
}

// 执行特定函数知道满足特定条件
export function until(
  fn: () => Promise<any>,
  when: (ret: any) => boolean,
  getCanceler: (fn: () => any) => void,
  interval = 5000
) {
  let timer: ReturnType<typeof setTimeout>
  let stoped = false

  return new Promise((resolve, reject) => {
    const cancel = () => {
      clearTimeout(timer)
      stoped = true
    }

    const check = async () => {
      try {
        const ret = await fn()

        if (stoped) {
          return
        } else if (when(ret)) {
          stoped = true
          resolve(ret)
        } else {
          timer = setTimeout(check, interval)
        }
      } catch (e) {
        reject(e)
      }
    }

    check()
    getCanceler && getCanceler(cancel)
  })
}

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export function difference<T extends { [propName: string]: any }, U extends { [propName: string]: any }>(
  object: T,
  base: U,
  keepProps?: Array<string>
): { [propName: string]: any } {
  function changes(object: T, base: U) {
    if (isObject(object) && isObject(base)) {
      const keys: Array<keyof T & keyof U> = uniq(Object.keys(object).concat(Object.keys(base)))
      let result: any = {}

      keys.forEach((key) => {
        const a: any = object[key as keyof T]
        const b: any = base[key as keyof U]

        if (keepProps && ~keepProps.indexOf(key as string)) {
          result[key] = a
        }

        if (isEqual(a, b)) {
          return
        }

        if (!object.hasOwnProperty(key)) {
          result[key] = undefined
        } else if (Array.isArray(a) && Array.isArray(b)) {
          result[key] = a
        } else {
          result[key] = changes(a as any, b as any)
        }
      })

      return result
    } else {
      return object
    }
  }
  return changes(object, base)
}

/**
 * 判断两个对象中指定的属性是否存在变化
 * @param attrs 指定的属性
 * @param from 对象1
 * @param to 对象2
 * @param strictMode 是否严格比较
 * @returns
 */
export function anyChanged(
  attrs: string | Array<string>,
  from: { [propName: string]: any },
  to: { [propName: string]: any },
  strictMode = true
): boolean {
  return (typeof attrs === 'string' ? attrs.split(/\s*,\s*/) : attrs).some((key) =>
    strictMode ? from[key] !== to[key] : from[key] != to[key]
  )
}

/**
 * 比较两个数组间是否发生修改
 * @param prev
 * @param next
 * @param strictMode
 * @returns
 */
export function isArrayChildrenModified(prev: Array<any>, next: Array<any>, strictMode = true) {
  if (!Array.isArray(prev) || !Array.isArray(next)) {
    return strictMode ? prev !== next : prev != next
  }

  if (prev.length !== next.length) {
    return true
  }

  for (let i: number = prev.length - 1; i >= 0; i--) {
    if (strictMode ? prev[i] !== next[i] : prev[i] != next[i]) {
      return true
    }
  }

  return false
}

/**
 * 给目标对象添加其他属性，可读取但是不会被遍历。
 * @param target
 * @param props
 */
export function injectPropsToObject(target: any, props: any) {
  const sup = Object.create(target.__super || null)
  Object.keys(props).forEach((key) => (sup[key] = props[key]))
  const result = Object.create(sup)
  Object.keys(target).forEach((key) => (result[key] = target[key]))
  return result
}

export function immutableExtends(to: any, from: any, deep = false) {
  // 不是对象，不可以merge
  if (!isObject(to) || !isObject(from)) {
    return to
  }

  let ret = to

  Object.keys(from).forEach((key) => {
    const origin = to[key]
    const value = from[key]

    // todo 支持深度merge
    if (origin !== value) {
      // 一旦有修改，就创建个新对象。
      ret = ret !== to ? ret : { ...to }
      ret[key] = value
    }
  })

  return ret
}

/** 将上下文指定的方法绑定到当前上下文 */
export const bulkBindFunctions = function <
  T extends {
    [propName: string]: any
  }
>(context: T, funNames: Array<FunctionPropertyNames<T>>) {
  funNames.forEach((key) => (context[key] = context[key].bind(context)))
}

/**
 * 深度查找具有某个 key 名字段的对象，实际实现是 internalFindObjectsWithKey，这里包一层是为了做循环引用检测
 * @param obj
 * @param key
 */
export function findObjectsWithKey(obj: any, key: string) {
  // 避免循环引用导致死循环
  if (isCyclic(obj)) {
    return []
  }
  return internalFindObjectsWithKey(obj, key)
}

/**
 * 检查对象是否有循环引用，来自 https://stackoverflow.com/a/34909127
 * @param obj
 */
function isCyclic(obj: any): boolean {
  const seenObjects: any = []
  function detect(obj: any) {
    if (obj && typeof obj === 'object') {
      if (seenObjects.indexOf(obj) !== -1) {
        return true
      }
      seenObjects.push(obj)
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && detect(obj[key])) {
          return true
        }
      }
    }
    return false
  }
  return detect(obj)
}

function internalFindObjectsWithKey(obj: any, key: string) {
  let objects: any[] = []
  for (const k in obj) {
    if (!obj.hasOwnProperty(k)) continue
    if (k === key) {
      objects.push(obj)
    } else if (typeof obj[k] === 'object') {
      objects = objects.concat(internalFindObjectsWithKey(obj[k], key))
    }
  }
  return objects
}

/** 根据路径获取数据值 */
export function getVariable(data: { [propName: string]: any }, key: string | undefined, canAccessSuper = true): any {
  if (!data || !key) {
    return undefined
  } else if (canAccessSuper ? key in data : data.hasOwnProperty(key)) {
    return data[key]
  }

  return keyToPath(key).reduce(
    (obj, key) =>
      obj && typeof obj === 'object' && (canAccessSuper ? key in obj : obj.hasOwnProperty(key)) ? obj[key] : undefined,
    data
  )
}

/** 根据路径设置数据值 */
export function setVariable(data: { [propName: string]: any }, key: string, value: any) {
  data = data || {}

  if (key in data) {
    data[key] = value
    return
  }

  const parts = keyToPath(key)
  const last = parts.pop() as unknown as string

  while (parts.length) {
    let key = parts.shift() as unknown as string
    if (isPlainObject(data[key])) {
      data = data[key] = {
        ...data[key]
      }
    } else if (Array.isArray(data[key])) {
      data[key] = data[key].concat()
      data = data[key]
    } else if (data[key]) {
      // throw new Error(`目标路径不是纯对象，不能覆盖`);
      // 强行转成对象
      data[key] = {}
      data = data[key]
    } else {
      data[key] = {}
      data = data[key]
    }
  }

  data[last] = value
}

/** 根据路径删除数据值 */
export function deleteVariable(data: { [propName: string]: any }, key: string) {
  if (!data) {
    return
  } else if (data.hasOwnProperty(key)) {
    delete data[key]
    return
  }

  const parts = keyToPath(key)
  const last = parts.pop() as unknown as string

  while (parts.length) {
    let key = parts.shift() as unknown as string
    if (isPlainObject(data[key])) {
      data = data[key] = {
        ...data[key]
      }
    } else if (data[key]) {
      throw new Error(`目标路径不是纯对象，不能修改`)
    } else {
      break
    }
  }

  if (data && data.hasOwnProperty && data.hasOwnProperty(last)) {
    delete data[last]
  }
}

/** 判断路径是否存在 */
export function hasOwnProperty(data: { [propName: string]: any }, key: string): boolean {
  const parts = keyToPath(key)

  while (parts.length) {
    let key = parts.shift() as unknown as string
    if (!isObject(data) || !data.hasOwnProperty(key)) {
      return false
    }

    data = data[key]
  }

  return true
}

/**
 * 将例如像 a.b.c 或 a[1].b 的字符串转换为路径数组
 *
 * @param string 要转换的字符串
 */
export const keyToPath = (string: string) => {
  const result: any[] = []

  if (string.charCodeAt(0) === '.'.charCodeAt(0)) {
    result.push('')
  }

  string.replace(
    new RegExp(
      '[^.[\\]]+|\\[(?:([^"\'][^[]*)|(["\'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2)\\]|(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))',
      'g'
    ),
    (match, expression, quote, subString) => {
      let key = match
      if (quote) {
        key = subString.replace(/\\(\\)?/g, '$1')
      } else if (expression) {
        key = expression.trim()
      }
      result.push(key)
      return ''
    }
  )

  return result
}

/**
 * 生成 8 位随机数字。
 *
 * @return {string} 8位随机数字
 */
export function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }
  return s4() + s4() + s4()
}

/**
 * 基于时间戳的 uuid
 *
 * @returns uniqueId
 */
export function uniqId() {
  return (+new Date()).toString(36)
}

// 参考 https://github.com/streamich/v4-uuid
const str = () =>
  // eslint-disable-next-line
  ('00000000000000000' + (Math.random() * 0xffffffffffffffff).toString(16)).slice(-16)

export const uuidv4 = () => {
  const a = str()
  const b = str()
  return `${a.slice(0, 8)}-${a.slice(8, 12)}-4${a.slice(13)}-a${b.slice(1, 4)}-${b.slice(4)}`
}

/**
 * 结合uniqId和uuidv4
 *
 * @returns uniqueId
 */
export const uuid = () => {
  const a = str()
  const b = str()
  return `${uniqId()}-${a.slice(8, 12)}-4${a.slice(13)}-a${b.slice(1, 4)}-${b.slice(4)}`
}

/** 字符串转换为正则 */
export function string2regExp(value: string, caseSensitive = false) {
  if (typeof value !== 'string') {
    throw new TypeError('Expected a string')
  }

  return new RegExp(value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d'), !caseSensitive ? 'i' : '')
}

/**
 * 首字母大写
 * @param str
 * @returns
 */
export function ucFirst(str?: string) {
  return typeof str === 'string' ? str.substring(0, 1).toUpperCase() + str.substring(1) : str
}

/**
 * 首字母小写
 * @param str
 * @returns
 */
export function lcFirst(str?: string) {
  return str ? str.substring(0, 1).toLowerCase() + str.substring(1) : ''
}

/**
 * 转换驼峰命名
 * @param str
 * @returns
 */
export function camel(str?: string) {
  return str
    ? str
        .split(/[\s_\-]/)
        .map((item, index) => (index === 0 ? lcFirst(item) : ucFirst(item)))
        .join('')
    : ''
}

export function qsstringify(
  data: any,
  options: any = {
    arrayFormat: 'indices',
    encodeValuesOnly: true
  },
  keepEmptyArray?: boolean
) {
  // qs会保留空字符串。fix: Combo模式的空数组，无法清空。改为存为空字符串；只转换一层
  keepEmptyArray &&
    Object.keys(data).forEach((key: any) => {
      Array.isArray(data[key]) && !data[key].length && (data[key] = '')
    })
  return qs.stringify(data, options)
}

export function qsparse(
  data: string,
  options: any = {
    arrayFormat: 'indices',
    encodeValuesOnly: true,
    depth: 1000 // 默认是 5， 所以condition-builder只要来个条件组就会导致报错
  }
) {
  return qs.parse(data, options)
}

/** 解析页面路径 */
export function parsePagePath(path: string): { path: string; query?: any; queryStr?: string } {
  if (!path) return { path }

  let qryPath = path
  let qryStr = ''
  let qryData: any = undefined

  const pathQueryIndex = path.indexOf('?')
  if (pathQueryIndex >= 0) {
    qryPath = path.substr(0, pathQueryIndex)
    qryStr = path.substr(pathQueryIndex + 1)

    if (qryStr) {
      qryData = qs.parse(qryStr)
    }
  }

  return { path: qryPath, query: qryData, queryStr: qryStr }
}

/** 获取页面唯一key */
export function getPageKey(page: any) {
  if (!page?.path) return null

  let { path, query } = page

  let qstr = query || ''

  if (isObject(query)) {
    if (!Object.keys(query).length) {
      qstr = ''
    } else {
      const pathData = parsePagePath(path)
      path = pathData.path

      if (pathData.queryStr) {
        query = Object.assign({}, pathData.query, query)
      }

      qstr = qs.stringify(query, {
        sort: simpleCompare
      })
    }
  }

  return qstr ? `${path}?${qstr}` : path
}

/** schema上是否存在显示表达式 */
export function hasVisibleExpression(schema: {
  visibleOn?: string
  hiddenOn?: string
  visible?: boolean
  hidden?: boolean
}) {
  return schema?.visibleOn || schema?.hiddenOn
}

/** 计算node是否显示 */
export function isVisible(
  schema: {
    visibleOn?: string
    hiddenOn?: string
    visible?: boolean
    hidden?: boolean
  },
  data?: object
) {
  return !(
    schema.hidden ||
    schema.visible === false ||
    (schema.hiddenOn && evalExpression(schema.hiddenOn, data) === true) ||
    (schema.visibleOn && evalExpression(schema.visibleOn, data) === false)
  )
}

/** 判断节点是否折叠 */
export function isUnfolded(
  node: any,
  config: {
    foldedField?: string
    unfoldedField?: string
  }
): boolean {
  let { foldedField, unfoldedField } = config

  unfoldedField = unfoldedField || 'unfolded'
  foldedField = foldedField || 'folded'

  let ret = false
  if (unfoldedField && typeof node[unfoldedField] !== 'undefined') {
    ret = !!node[unfoldedField]
  } else if (foldedField && typeof node[foldedField] !== 'undefined') {
    ret = !node[foldedField]
  }

  return ret
}

/**
 * 过滤掉被隐藏的数组元素
 */
export function visibilityFilter(items: any, data?: object) {
  return items.filter((item: any) => {
    return isVisible(item, data)
  })
}

/** 计算node是否disabled */
export function isDisabled(
  schema: {
    disabledOn?: string
    disabled?: boolean
  },
  data?: object
) {
  return schema.disabled || (schema.disabledOn && evalExpression(schema.disabledOn, data))
}

/** 计算schema是否处于特定状态，比如显示、隐藏、disable等 */
export function hasAbility(schema: any, ability: string, data?: object, defaultValue = true): boolean {
  return schema.hasOwnProperty(ability)
    ? schema[ability]
    : schema.hasOwnProperty(`${ability}On`)
    ? evalExpression(schema[`${ability}On`], data || schema)
    : defaultValue
}

export function makeHorizontalDeeper(
  horizontal: {
    left: string
    right: string
    offset: string
    leftFixed?: any
  },
  count: number
): {
  left: string | number
  right: string | number
  offset: string | number
  leftFixed?: any
} {
  if (count > 1 && /\bcol-(xs|sm|md|lg)-(\d+)\b/.test(horizontal.left)) {
    const flex = parseInt(RegExp.$2, 10) * count
    return {
      leftFixed: horizontal.leftFixed,
      left: flex,
      right: 12 - flex,
      offset: flex
    }
  } else if (count > 1 && typeof horizontal.left === 'number') {
    const flex = horizontal.left * count

    return {
      leftFixed: horizontal.leftFixed,
      left: flex,
      right: 12 - flex,
      offset: flex
    }
  }

  return horizontal
}

export function getScrollParent(node: HTMLElement): HTMLElement | null {
  if (node == null) {
    return null
  }

  const style = getComputedStyle(node)

  if (!style) {
    return null
  }

  const text =
    style.getPropertyValue('overflow') + style.getPropertyValue('overflow-x') + style.getPropertyValue('overflow-y')

  if (/auto|scroll/.test(text) || node.nodeName === 'BODY') {
    return node
  }

  return getScrollParent(node.parentNode as HTMLElement)
}

/** 合并多个方法为一个串行方法 */
export function chainFunctions(...fns: Array<(...args: Array<any>) => void>): (...args: Array<any>) => void {
  return (...args: Array<any>) =>
    fns.reduce(
      (ret: any, fn: any) => (ret === false ? false : typeof fn == 'function' ? fn(...args) : undefined),
      undefined
    )
}

/** 合并一个元素事件的多个方法 */
export function chainEvents(props: any, schema: any) {
  const ret: any = {}

  Object.keys(props).forEach((key) => {
    if (
      key.substr(0, 2) === 'on' &&
      typeof props[key] === 'function' &&
      typeof schema[key] === 'function' &&
      schema[key] !== props[key]
    ) {
      // 表单项里面的 onChange 很特殊，这个不要处理。
      if (props.formStore && key === 'onChange') {
        ret[key] = props[key]
      } else {
        ret[key] = chainFunctions(schema[key], props[key])
      }
    } else {
      ret[key] = props[key]
    }
  })

  return ret
}

// xs < 768px
// sm >= 768px
// md >= 992px
// lg >= 1200px
export function isBreakpoint(str: string): boolean {
  if (typeof str !== 'string') {
    return !!str
  }

  const breaks = str.split(/\s*,\s*|\s+/)

  if ((window as any).matchMedia) {
    return breaks.some(
      (item) =>
        item === '*' ||
        (item === 'xs' && matchMedia(`screen and (max-width: 767px)`).matches) ||
        (item === 'sm' && matchMedia(`screen and (min-width: 768px) and (max-width: 991px)`).matches) ||
        (item === 'md' && matchMedia(`screen and (min-width: 992px) and (max-width: 1199px)`).matches) ||
        (item === 'lg' && matchMedia(`screen and (min-width: 1200px)`).matches)
    )
  } else {
    const width = window.innerWidth
    return breaks.some(
      (item) =>
        item === '*' ||
        (item === 'xs' && width < 768) ||
        (item === 'sm' && width >= 768 && width < 992) ||
        (item === 'md' && width >= 992 && width < 1200) ||
        (item === 'lg' && width >= 1200)
    )
  }
}

// 获取宽度值
export function getWidthRate(value: any, strictMode = false): number {
  if (typeof value === 'string' && /\bcol\-\w+\-(\d+)\b/.test(value)) {
    return parseInt(RegExp.$1, 10)
  }

  return strictMode ? 0 : value || 0
}

export function getLevelFromClassName(value: string, defaultValue = 'default') {
  if (/\b(?:btn|text)-(link|primary|secondary|info|success|warning|danger|light|dark)\b/.test(value)) {
    return RegExp.$1
  }

  return defaultValue
}

// 只判断一层, 如果层级很深，form-data 也不好表达。
export function hasFile(object: any): boolean {
  return Object.keys(object).some((key) => {
    let value = object[key]

    return value instanceof File || (Array.isArray(value) && value.length && value[0] instanceof File)
  })
}

/** 对象转换为formData */
export function object2formData(
  data: any,
  options: any = {
    arrayFormat: 'indices',
    encodeValuesOnly: true
  },
  fd: FormData = new FormData()
): any {
  let fileObjects: any = []
  let others: any = {}

  Object.keys(data).forEach((key) => {
    const value = data[key]

    if (value instanceof File) {
      fileObjects.push([key, value])
    } else if (Array.isArray(value) && value.length && value[0] instanceof File) {
      value.forEach((value) => fileObjects.push([`${key}[]`, value]))
    } else {
      others[key] = value
    }
  })

  // 因为 key 的格式太多了，偷个懒，用 qs 来处理吧。
  qsstringify(others, options)
    .split('&')
    .forEach((item) => {
      let parts = item.split('=')
      // form-data/multipart 是不需要 encode 值的。
      parts[0] && fd.append(parts[0], decodeURIComponent(parts[1]))
    })

  // Note: File类型字段放在后面，可以支持第三方云存储鉴权
  fileObjects.forEach((fileObject: any[]) => fd.append(fileObject[0], fileObject[1], fileObject[1].name))

  return fd
}

/** 动态加载脚本 */
export function loadScript(src: string) {
  return new Promise<void>((ok, fail) => {
    const script = document.createElement('script')
    script.onerror = (reason) => fail(reason)

    if (~src.indexOf('{{callback}}')) {
      const callbackFn = `loadscriptcallback_${uuid()}`
      ;(window as any)[callbackFn] = () => {
        ok()
        delete (window as any)[callbackFn]
      }
      src = src.replace('{{callback}}', callbackFn)
    } else {
      script.onload = () => ok()
    }

    script.src = src
    document.head.appendChild(script)
  })
}

let scrollbarWidth: number

/**
 * 获取浏览器滚动条宽度 https://stackoverflow.com/a/13382873
 */

export function getScrollbarWidth() {
  if (typeof scrollbarWidth !== 'undefined') {
    return scrollbarWidth
  }
  // Creating invisible container
  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.overflow = 'scroll' // forcing scrollbar to appear
  // @ts-ignore
  outer.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps
  document.body.appendChild(outer)

  // Creating inner element and placing it in the container
  const inner = document.createElement('div')
  outer.appendChild(inner)

  // Calculating difference between container's full width and the child width
  scrollbarWidth = outer.offsetWidth - inner.offsetWidth

  // Removing temporary elements from the DOM
  if (outer.parentNode) {
    outer.parentNode.removeChild(outer)
  }

  return scrollbarWidth
}

function resolveValueByName(data: any, name?: string) {
  return isPureVariable(name) ? resolveVariableAndFilter(name, data) : resolveVariable(name, data)
}

// 统一的获取 value 值方法
export function getPropValue<
  T extends {
    value?: any
    name?: string
    data?: any
    defaultValue?: any
  }
>(props: T, getter?: (props: T) => any) {
  const { name, value, data, defaultValue } = props
  return value ?? getter?.(props) ?? resolveValueByName(data, name) ?? defaultValue
}

// 检测 value 是否有变化，有变化就执行 onChange
export function detectPropValueChanged<
  T extends {
    value?: any
    name?: string
    data?: any
    defaultValue?: any
  }
>(props: T, prevProps: T, onChange: (value: any) => void, getter?: (props: T) => any) {
  let nextValue: any
  if (typeof props.value !== 'undefined') {
    props.value !== prevProps.value && onChange(props.value)
  } else if ((nextValue = getter?.(props)) !== undefined) {
    nextValue !== getter!(prevProps) && onChange(nextValue)
  } else if (typeof props.name === 'string' && (nextValue = resolveValueByName(props.data, props.name)) !== undefined) {
    nextValue !== resolveValueByName(prevProps.data, prevProps.name) && onChange(nextValue)
  } else if (props.defaultValue !== prevProps.defaultValue) {
    onChange(props.defaultValue)
  }
}

export function pickEventsProps(props: any) {
  const ret: any = {}
  props && Object.keys(props).forEach((key) => /^on/.test(key) && (ret[key] = props[key]))
  return ret
}

// 去掉字符串中的 html 标签，不完全准确但效率比较高
export function removeHTMLTag(str: string) {
  return str.replace(/<\/?[^>]+(>|$)/g, '')
}

export function __uri(id: string) {
  return id
}

export function omitControls(controls: Array<any>, omitItems: Array<string>): Array<any> {
  return controls.filter((control) => !~omitItems.indexOf(control.name || control._name))
}

export const padArr = (arr: Array<any>, size = 4): Array<Array<any>> => {
  const ret: Array<Array<any>> = []
  const pool: Array<any> = arr.concat()
  let from = 0

  while (pool.length) {
    let host: Array<any> = ret[from] || (ret[from] = [])

    if (host.length >= size) {
      from += 1
      continue
    }

    host.push(pool.shift())
  }

  return ret
}

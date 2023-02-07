import { _ } from './util'
import * as dateUtil from './date'

import type { DateValue, DataOptionItem } from '../typings'
import type { App } from '../app'

/** 值格式化上下文 */
export interface FormatterOptionsContext {
  app?: App
  [prop: string]: any
}

export interface MoneyFormatOptions {
  decimals?: number // 保留小数位数
  decimalSep?: string // 小数点符号
  thousandSep?: string // 千分位符号
  emptyText?: string // 为空时字符串
}

/** 格式化金额(分) */
export function fenMoney(input: number, opts: MoneyFormatOptions = {}) {
  if (_.isNil(input)) return opts.emptyText || 'N/A'

  const yuan = +(+input / 100).toFixed(opts.decimals || 2)

  return yuanMoney(yuan, opts)
}

/** 格式化金额（元） */
export function yuanMoney(input: number, opts: MoneyFormatOptions = {}) {
  if (_.isNil(input)) return opts.emptyText || 'N/A'

  const decimals = opts.decimals || 2

  const num = (input + '').replace(/[^0-9+-Ee.]/g, '')

  let n = !isFinite(+num) ? 0 : +num,
    prec = !isFinite(decimals) ? 0 : Math.abs(decimals),
    sep = opts.thousandSep || ',',
    dec = opts.decimalSep || '.',
    s: string | string[] = '',
    toFixedFix = function (n: number, prec: number) {
      const num = parseFloat(String(n))
      return (Math.round((num + Number.EPSILON) * Math.pow(10, prec)) / Math.pow(10, prec)).toFixed(prec)
    }

  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
  const re = /(-?\d+)(\d{3})/

  while (re.test(s[0])) {
    s[0] = s[0].replace(re, '$1' + sep + '$2')
  }

  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += new Array(prec - s[1].length + 1).join('0')
  }

  return s.join(dec)
}

/** 格式化枚举值 */
export function enumStr(
  input: number | string,
  opts: {
    context?: FormatterOptionsContext
    options?: DataOptionItem[] | Record<string | number, string> | string
  } = {}
) {
  let options: any = opts?.options

  if (_.isString(options) && opts.context?.app) {
    options = opts.context?.app.getCommonOptions(options)
  }

  if (!options) return input

  let str: any = input

  if (Array.isArray(options)) {
    str = options.find(it => it.value === input)?.label
  } else {
    str = options[String(input)]
  }

  if (!str) str = input

  return str
}

/** 格式化日期 */
export function date(input: DateValue, opts?: { formatType: string; emptyText: string }) {
  const emptyText = opts?.emptyText || '--'
  const formatType = opts?.formatType || 'YYYY-MM-DD'

  if (_.isNil(input)) return emptyText

  return dateUtil.format(input, formatType)
}

/** 是否格式化  */
export function yesNo(input: number | boolean, opts: { options?: string[] } = {}) {
  const options = opts?.options || []

  if (_.isNil(input)) return ''

  if (input) {
    return options[0] || '是'
  } else {
    return options[1] || '否'
  }
}

/** 启用停用 */
export function enableStr(input: any, options?: string[]) {
  options = options || ['启用', '停用']

  return yesNo(input, {options})
}

/** 对象字符串化 */
export function stringify(input: string) {
  if (_.isPlainObjectOrArray(input)) {
    return JSON.stringify(input, null, 2)
  }
  return input
}

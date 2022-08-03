import { _ } from './util'

export interface MoneyFormatOptions {
  decimals?: number // 保留小数位数
  decimalSep?: string // 小数点符号
  thousandSep?: string // 千分位符号
  emptyText?: string // 为空时字符串
}

/** 格式化金额(分) */
export function fenMoney(input: number, options: MoneyFormatOptions = {}) {
  if (_.isNil(input)) return options.emptyText || 'N/A'

  const yuan = +(+input / 100).toFixed(options.decimals || 2)

  return yuanMoney(yuan, options)
}

/** 格式化金额（元） */
export function yuanMoney(input: number, options: MoneyFormatOptions = {}) {
  if (_.isNil(input)) return options.emptyText || 'N/A'

  const decimals = options.decimals || 2

  const num = (input + '').replace(/[^0-9+-Ee.]/g, '')

  let n = !isFinite(+num) ? 0 : +num,
    prec = !isFinite(decimals) ? 0 : Math.abs(decimals),
    sep = options.thousandSep || ',',
    dec = options.decimalSep || '.',
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

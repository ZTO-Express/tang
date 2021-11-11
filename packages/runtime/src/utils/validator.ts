interface IRadix {
  from?: number
  to?: number
}

/**
 * 处理小数点后几位正则
 * @param radix {IRadix}
 * @private
 */
export function resolveRadixCountReg(radix?: IRadix) {
  return !radix ? '*' : `{${radix.from || '1'},${radix.to || ''}}`
}

/** 数字 */
export function isNumeric(s: string) {
  return /^\-?(?:[1-9]\d*|0)(?:\.\d+)?$/.test(s)
}

/** 小数 */
export function isDecimal(s: string, radix?: IRadix) {
  const regex = `^[-+]?(?:0|[1-9]\\d*)\\.\\d${resolveRadixCountReg(radix)}$`

  return new RegExp(regex).test(s)
}

/** 负小数 */
export function isNegativeDecimal(s: string, radix?: IRadix) {
  const regex = `^\\-?(?:0|[1-9]\\d*)\\.\\d${resolveRadixCountReg(radix)}$`

  return new RegExp(regex).test(s)
}

/** 正小数 */
export function isPositiveDecimal(s: string, radix?: IRadix) {
  const regex = `^\\+?(?:0|[1-9]\\d*)\\.\\d${resolveRadixCountReg(radix)}$`

  return new RegExp(regex).test(s)
}

/** 整数 */
export function isInteger(s: string) {
  return /^[-+]?(?:0|[1-9]\d*)$/.test(s)
}

/** 正整数 */
export function isPositiveInteger(s: string) {
  return /^\+?(?:0|[1-9]\d*)$/.test(s)
}

/** 负整数 */
export function isNegativeInteger(s: string) {
  return /^\-?(?:0|[1-9]\d*)$/.test(s)
}

/** 手机号 */
export function isMobile(s: string) {
  return /^1[3-9][0-9]\d{8}$/.test(s)
}

/** email */
export function isEmail(s: string) {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    s
  )
}

/** 身份证号 */
export function isIdCardNo(s: string) {
  return /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
    s
  )
}

import { _, validator as v, useConfig } from '@zto/zpage'

/** 外部注册规则 */
export const outerRules = useConfig('components.form.rules')

export const innerRules = Object.freeze({
  required: {
    validator: (val: string, rule: any) => {
      return verifyRequired(val, rule)
    }
  },
  min: {
    validator: (val: string, rule: any) => {
      if (!val) return verifyRequired(val, rule)
      return val >= rule.min ? true : `${rule.label}不能小于${rule.min}。`
    }
  },
  max: {
    validator: (val: string, rule: any) => {
      if (!val) return verifyRequired(val, rule)
      return val <= rule.max ? true : `${rule.label}不能大于${rule.max}。`
    }
  },
  minlength: {
    validator: (val: string, rule: any) => {
      if (!val) return verifyRequired(val, rule)
      return String(val).length >= rule.minlength ? true : `${rule.label}长度不能小于${rule.minlength}`
    }
  },
  maxlength: {
    validator: (val: string, rule: any) => {
      if (!val) return verifyRequired(val, rule)
      return String(val).length <= rule.maxlength ? true : `${rule.label}长度不能大于${rule.maxlength}`
    }
  },
  fixedLengths: {
    validator: (val: string, rule: any) => {
      if (!val) return verifyRequired(val, rule)
      return isValidLength(String(val), rule.lengths) ? true : `无效长度。`
    }
  },
  code: {
    required: true,
    message: '请输入正确的编号',
    validator: (val: string, rule: any) => {
      return isValidCode(val) ? true : '无效编号。'
    }
  },
  mobile: {
    message: '请输入正确的手机号码',
    validator: (val: string, rule: any) => {
      if (!val) return rule.required === false
      return v.isMobile(val) ? true : '无效手机号码。'
    }
  },
  email: {
    message: '请输入正确的邮件地址',
    validator: (val: string, rule: any) => {
      if (!val) return rule.required === false
      return v.isEmail(val) ? true : '无效邮件地址。'
    }
  },
  idCardNo: {
    message: '请输入正确的身份证号',
    validator: (val: string, rule: any) => {
      return isValidIdCardNo(val, rule.required) ? true : '身份证号输入有误'
    }
  },
  integer: {
    validator: (val: string, rule: any) => {
      if (!val) return rule.required === false
      return v.isInteger(val) ? true : `${rule.label}必须为整数`
    }
  },
  positiveInteger: {
    validator: (val: string, rule: any) => {
      if (!val) return rule.required === false
      return v.isPositiveInteger(val) ? true : `${rule.label}必须为正整数`
    }
  },
  negativeInteger: {
    validator: (val: string, rule: any) => {
      if (!val) return rule.required === false
      return v.isNegativeInteger(val) ? true : `${rule.label}必须为负整数`
    }
  },
  numeric: {
    validator: (val: string, rule: any) => {
      if (!val) return rule.required === false
      return v.isNumeric(val) ? true : `${rule.label}必须为数字`
    }
  },
  decimal: {
    validator: (val: string, rule: any) => {
      if (!val) return rule.required === false
      const radixMsg = rule.radix.from === rule.radix.to ? rule.radix.from : `${rule.radix.from}至${rule.radix.to}`
      return v.isDecimal(val, rule.radix) ? true : `${rule.label}必须为${radixMsg}位小数`
    }
  },
  positiveDecimal: {
    validator: (val: string, rule: any) => {
      if (!val) return rule.required === false
      const radixMsg = rule.radix.from === rule.radix.to ? rule.radix.from : `${rule.radix.from}至${rule.radix.to}`
      return v.isPositiveDecimal(val, rule.radix) ? true : `${rule.label}必须为${radixMsg}位正小数`
    }
  },
  negativeDecimal: {
    validator: (val: string, rule: any) => {
      if (!val) return rule.required === false
      const radixMsg = rule.radix.from === rule.radix.to ? rule.radix.from : `${rule.radix.from}至${rule.radix.to}`
      return v.isNegativeDecimal(val, rule.radix) ? true : `${rule.label}必须为${radixMsg}位负小数`
    }
  }
})

export const allRules = { ...innerRules, ...outerRules }

/** 验证必填 */
export async function verifyRequired(val: any, rule: any) {
  const isEmpty = _.isNil(val) || val === '' || (Array.isArray(val) && !val.length)

  const message = rule.message || `${(rule.messagePrefix || '请输入') + rule.label || ''}`
  return !isEmpty ? true : message
}

/** 判断编码是否是有效的，数字 字符 -_ 组合 */
export function isValidCode(str: string) {
  if (!str) return false
  return /^[\w\-]+$/.test(str)
}

/** 判断身份证号是否有效 */
export function isValidIdCardNo(str: string, required = false) {
  if (!str) return required === false
  return v.isIdCardNo(str)
}

/**
 * 是否有效的长度
 * @param str 目标字符串
 * @param lengths 待验证长度
 * @param required 是否必填
 * @returns
 */
export function isValidLength(str: string, lengths: number[] | number, required = false) {
  const lens = Array.isArray(lengths) ? lengths : [lengths]
  return (!required && !str) || lens.includes(str?.length)
}

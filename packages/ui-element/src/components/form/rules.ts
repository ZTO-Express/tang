import { _, validator as v, useConfig } from '@zto/zpage'

import type { GenericFunction } from '@zto/zpage'

/** 外部注册规则 */
export const outerRules = useConfig('components.form.rules')

export const innerRules = Object.freeze({
  required: {
    required: true,
    message: '请输入',
    validator: (rule: any, val: string, cb: GenericFunction) => {
      return verifyRequired(rule, val, cb)
    }
  },
  min: {
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return verifyRequired(rule, val, cb)
      val >= rule.min ? cb() : cb(new Error(`${rule.label}不能小于${rule.min}。`))
    }
  },
  max: {
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return verifyRequired(rule, val, cb)
      val <= rule.max ? cb() : cb(new Error(`${rule.label}不能大于${rule.max}。`))
    }
  },
  minlength: {
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return verifyRequired(rule, val, cb)
      String(val).length >= rule.minlength ? cb() : cb(new Error(`${rule.label}长度不能小于${rule.minlength}`))
    }
  },
  maxlength: {
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return verifyRequired(rule, val, cb)
      String(val).length <= rule.maxlength ? cb() : cb(new Error(`${rule.label}长度不能大于${rule.maxlength}`))
    }
  },
  fixedLengths: {
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return verifyRequired(rule, val, cb)
      isValidLength(String(val), rule.lengths) ? cb() : cb(new Error(`无效长度。`))
    }
  },
  code: {
    required: true,
    message: '请输入正确的编号',
    validator: (rule: any, val: string, cb: GenericFunction) => {
      isValidCode(val) ? cb() : cb(new Error('无效编号。'))
    }
  },
  mobile: {
    message: '请输入正确的手机号码',
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return rule.required === false
      v.isMobile(val) ? cb() : cb(new Error('无效手机号码。'))
    }
  },
  email: {
    message: '请输入正确的邮件地址',
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return rule.required === false
      v.isEmail(val) ? cb() : cb(new Error('无效邮件地址。'))
    }
  },
  idCardNo: {
    message: '请输入正确的身份证号',
    validator: (rule: any, val: string, cb: GenericFunction) => {
      isValidIdCardNo(val, rule.required) ? cb() : cb(new Error('身份证号输入有误'))
    }
  },
  integer: {
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return rule.required === false
      v.isInteger(val) ? cb() : cb(new Error(`${rule.label}必须为整数`))
    }
  },
  positiveInteger: {
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return rule.required === false
      v.isPositiveInteger(val) ? cb() : cb(new Error(`${rule.label}必须为正整数`))
    }
  },
  negativeInteger: {
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return rule.required === false
      v.isNegativeInteger(val) ? cb() : cb(new Error(`${rule.label}必须为负整数`))
    }
  },
  numeric: {
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return rule.required === false
      v.isNumeric(val) ? cb() : cb(new Error(`${rule.label}必须为数字`))
    }
  },
  decimal: {
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return rule.required === false
      const radixMsg = rule.radix.from === rule.radix.to ? rule.radix.from : `${rule.radix.from}至${rule.radix.to}`
      v.isDecimal(val, rule.radix) ? cb() : cb(new Error(`${rule.label}必须为${radixMsg}位小数`))
    }
  },
  positiveDecimal: {
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return rule.required === false
      const radixMsg = rule.radix.from === rule.radix.to ? rule.radix.from : `${rule.radix.from}至${rule.radix.to}`
      v.isPositiveDecimal(val, rule.radix) ? cb() : cb(new Error(`${rule.label}必须为${radixMsg}位正小数`))
    }
  },
  negativeDecimal: {
    validator: (rule: any, val: string, cb: GenericFunction) => {
      if (!val) return rule.required === false
      const radixMsg = rule.radix.from === rule.radix.to ? rule.radix.from : `${rule.radix.from}至${rule.radix.to}`
      v.isNegativeDecimal(val, rule.radix) ? cb() : cb(new Error(`${rule.label}必须为${radixMsg}位负小数`))
    }
  }
})

export const allRules = { ...innerRules, ...outerRules }

/** 验证必填 */
export function verifyRequired(rule: any, val: string, cb: GenericFunction) {
  if (!rule.required) cb()
  !_.isNil(val) ? cb() : cb(new Error(`${rule.message || '请输入'}`))
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

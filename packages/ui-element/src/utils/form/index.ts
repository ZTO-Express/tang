import { innerRules } from './rules'

import type { FormItemConfig } from './types'

export type { FormItemConfig }

/**
 * 从formItem配置中获取规则
 */
export function getFormItemRules(config: any) {
  const cfgRules = config.rules || []
  // 扩展规则
  const exFormRules = config.exFormRules || {}

  if (config.required) {
    const messagePrefix = config.messagePrefix || /(s|S)elect$/.test(config.type) ? '请选择' : '请输入'
    mergeRule('required', cfgRules, { label: config.label, messagePrefix })
  }

  if (config.minlength) {
    mergeRule('minlength', cfgRules, { minlength: config.minlength, label: config.label })
  }

  if (config.maxlength) {
    mergeRule('maxlength', cfgRules, { maxlength: config.maxlength, label: config.label })
  }

  /** 外部注册规则 */
  const allRules = { ...innerRules, ...exFormRules }

  const rules = cfgRules.map((it: any) => {
    if (it.ruleName) {
      const rule = allRules[it.ruleName]
      return { ...rule, ...it, label: config.label, context: config.context }
    }

    return { ...it, context: config.context }
  })

  return rules
}

// 合并规则
function mergeRule(ruleName: string, rules: any[], defRule: any) {
  const rIdx = rules.findIndex((r: any) => r.ruleName === ruleName)

  if (rIdx >= 0) {
    rules[rIdx] = { ruleName, ...defRule, ...rules[rIdx] }
  } else {
    rules.push({ ruleName, ...defRule })
  }
}

/**
 * 从formItems中找到指定的属性
 * @param prop
 * @param formItems
 * @returns
 */
export function findFormItem(prop: string, formItems: FormItemConfig[]) {
  let index = formItems.length
  while (index-- && formItems[index].prop !== prop);
  return { index, item: formItems[index] }
}

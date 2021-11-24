import { allRules } from './rules'
import type { FormItemConfig } from './types'

/**
 * 从formItem配置中获取规则
 */
export function getFormItemRules(config: any) {
  const cfgRules = config.rules || []
  if (config.required) {
    const message = /(s|S)elect$/.test(config.type) ? '请选择' : '请输入'
    cfgRules.push({ ruleName: 'required', label: config.label, message })
  }

  if (config.minlength) {
    cfgRules.push({ ruleName: 'minlength', minlength: config.minlength, label: config.label })
  }

  if (config.maxlength) {
    cfgRules.push({ ruleName: 'maxlength', maxlength: config.maxlength, label: config.label })
  }

  const rules = cfgRules.map((it: any) => {
    if (it.ruleName) {
      const rule = allRules[it.ruleName]
      return { ...rule, ...it, label: config.label }
    }

    return { ...it }
  })

  return rules
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

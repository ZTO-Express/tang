import { _ } from '@zto/zpage'
import { getJsonDefinition, parseJsonDefinition } from '@/utils/schema'

import { UIItemPrefix } from './ui'

import type { ZPageJsonDefinition } from '@/../typings'

export const UIFormItemPostfix = 'FormItem'

// 默认表单项定义
const DefaultFormItemDefinition = getJsonDefinition('UIInputFormItem')

/**
 * 根据表单项数据获取json定义
 * @param data
 * @returns
 */
export function getDevDefinitionByFormItemData(data: any) {
  if (!data?.type) return undefined

  const defName = data.__defName || getDefNameByFormItemType(data.type)
  const jsonDef = getJsonDefinition(defName) || DefaultFormItemDefinition

  const def = parseJsonDefinition(jsonDef)

  return def
}

/**
 * 解析formItem Definition
 */
export function parseUIFormItem(def: ZPageJsonDefinition) {
  let itemType = def.meta?.itemType
  if (!itemType) itemType = getFormItemTypeByDefName(def.name)

  itemType = itemType || 'input'

  const formItemData = { type: itemType, label: def.label, __defName: def.name, ...(def.default as any) }

  return formItemData
}

/**
 * 根据itemType获取定义名称
 */
export function getDefNameByFormItemType(typeName: string) {
  if (!typeName) return undefined

  if (isFormItemTypeDefName(typeName)) {
    return typeName
  }

  return UIItemPrefix + _.capitalize(_.camelize(typeName)) + UIFormItemPostfix
}

/**
 * 根据定义名获取文档名称
 */
export function getFormItemTypeByDefName(defName: string) {
  if (!defName) return undefined

  let itemType = defName

  if (isFormItemTypeDefName(defName)) {
    itemType = defName.substring(UIItemPrefix.length, defName.length - UIFormItemPostfix.length)
  }

  itemType = _.hyphenate(itemType)

  return itemType
}

/**
 * 判断defName是否符合formItem标准
 * @param defName
 * @returns
 */
export function isFormItemTypeDefName(defName: string) {
  return defName.startsWith(UIItemPrefix) && defName.endsWith(UIFormItemPostfix)
}

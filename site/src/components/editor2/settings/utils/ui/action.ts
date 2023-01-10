import { _ } from '@zto/zpage'
import { getJsonDefinition, parseJsonDefinition } from '@/utils/schema'
import { UIItemPrefix } from './ui'

import type { ZPageJsonDefinition } from '@/../typings'

export const UIActionPostfix = 'Action'

// 默认表单项定义
const DefaulActionDefinition = getJsonDefinition('UIApiAction')

/**
 * 根据action项目数据获取json定义
 */
export function getDevDefinitionByActionData(data: any) {
  if (!data) return undefined

  let defName = data.__defName

  // 如果定义名不存在，则根据数据形式获取活动类型
  if (!defName && !data.type) {
    if (data.import) {
      data.type = 'import'
    } else if (data.dialog) {
      data.type = 'dialog'
    } else if (data.download) {
      data.type = 'download'
    } else if (data.download) {
      data.type = 'link'
    } else if (data.download) {
      data.type = 'event'
    } else if (data.message) {
      data.type = 'confirm'
    } else if (data.confirm) {
      data.type = 'confirm'
    } else if (data.api) {
      data.type = 'api'
    }
  }

  // 定义名不存在，则通过类型获取定义名
  if (!defName && data.type) {
    defName = getDefNameByActionType(data.type)
  }

  const jsonDef = getJsonDefinition(defName)

  const def = parseJsonDefinition(jsonDef)

  return def || DefaulActionDefinition
}

/**
 * 解析action Definition
 */
export function parseUIActionItem(def: ZPageJsonDefinition, index?: number) {
  let itemType = def.meta?.itemType
  if (!itemType) itemType = getActionTypeByDefName(def.name)

  itemType = itemType || 'api'

  const actionData = { type: itemType, label: def.label, __defName: def.name, ...(def.default as any) }

  if (!actionData.name) {
    switch (actionData.type) {
      case 'dialog':
      case 'event':
      case 'link':
      case 'download':
        actionData.name = `${actionData.type}${index || ''}`
        break
      default:
        actionData.name = itemType
        break
    }
  }

  return actionData
}

/**
 * 根据itemType获取定义名称
 */
export function getDefNameByActionType(typeName: string) {
  if (!typeName) return undefined

  if (isActionTypeDefName(typeName)) {
    return typeName
  }

  return UIItemPrefix + _.capitalize(_.camelize(typeName)) + UIActionPostfix
}

/**
 * 根据定义名获取文档名称
 */
export function getActionTypeByDefName(defName: string) {
  if (!defName) return undefined

  let itemType = defName

  if (isActionTypeDefName(defName)) {
    itemType = defName.substring(UIItemPrefix.length, defName.length - UIActionPostfix.length)
  }

  itemType = _.hyphenate(itemType)

  return itemType
}

/**
 * 判断defName是否符合action标准
 * @param defName
 * @returns
 */
export function isActionTypeDefName(defName: string) {
  return defName.startsWith(UIItemPrefix) && defName.endsWith(UIActionPostfix)
}

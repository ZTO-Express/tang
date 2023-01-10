import { _, computed, CmptSchema, DataOptionItem } from '@zto/zpage'
import { uis } from '@/config/editor'
import { getJsonDefinition } from '@/utils/schema'

import type { UIItem, UIItemGroup } from '@/utils/schema/types'
import type { ZPageDevNode, ZPageDevProperty, ZPageJsonNode } from '@/../typings'

export const UIItemPrefix = 'UI'

/**
 * 应用默认值
 */
export function useUIProperty(props: { property: ZPageDevProperty; data: any }) {
  /** 有效数据属性 */
  const isValidDataProperty = () => {
    return !!(props?.data && props?.property?.name)
  }

  /**
   * 设置属性值
   * @param val
   */
  const setPropertyValue = (val: any) => {
    if (!isValidDataProperty()) return

    props.data[props.property.name] = val
  }

  const resetPropertyValue = () => {
    if (isDefaultProperty(props.property)) {
      setPropertyValue(props.property.default)
    } else if (isValidDataProperty()) {
      delete props.data[props.property.name]
    }
  }

  const propertyValue = computed(() => {
    if (!isValidDataProperty()) return undefined

    return props.data[props.property.name]
  })

  // 初始化默认属性
  if (isDefaultProperty(props.property) && !_.hasOwnProperty(props.data, props.property.name)) {
    setPropertyValue(props.property.default)
  }

  return { propertyValue, isValidDataProperty, resetPropertyValue, setPropertyValue }
}

/** 判断数据是否存在默认值 */
export function isDefaultProperty(node: ZPageDevNode | ZPageJsonNode) {
  return _.hasOwnProperty(node, 'default')
}

/** ui items去重 */
export function uniqueUIItems(items: UIItem[]) {
  const uniquedItems: UIItem[] = []

  items.forEach(it => {
    if (!uniquedItems.some(i => i.name === it.name)) {
      uniquedItems.push(it)
    }
  })

  return uniquedItems
}

/** 对ui进行分组 */
export function groupUIItems(items: UIItem[]) {
  const uniquedItems = uniqueUIItems(items)

  const uiOptions = getUIOptions()

  let groups: UIItemGroup[] = []

  uniquedItems.forEach(it => {
    const uiName = it.ui as string

    let group = groups.find(g => g.name === uiName)

    if (!group) {
      const opt = uiOptions.find(opt => opt.value === uiName)
      if (opt) {
        group = { name: uiName, label: opt.label, items: [] }
      } else {
        group = { name: uiName, label: uiName, items: [] }
      }

      group.index = opt?.index || groups.length

      groups.push(group)
    }

    group.items.push(it)
  })

  groups = _.sortBy(groups, 'index', -1)

  return groups
}

/** 获取ui选项 */
let __uiOptions: DataOptionItem[] = []
export function getUIOptions() {
  if (!__uiOptions?.length) {
    const def = getJsonDefinition('UIItemTypeEnum') as any

    if (def?.options?.length) {
      __uiOptions = _.sortBy(def.options, 'index', -1)
    }
  }

  return Object.freeze(__uiOptions)
}

/** 根据ui注解获取编辑器 */
export function getUIConfig(uiName: string | undefined) {
  if (!uiName) return undefined
  const config = _.deepClone(uis[uiName])
  return config
}

/**
 * UI编辑配置
 */
export interface UISettingsConfig {
  cmpt?: CmptSchema
  form?: {
    span?: number
    items: any[]
  }
}

/** 根据属性编辑器配置 */
export function getNodeUISettingsConfig(node: ZPageDevNode | undefined): UISettingsConfig | undefined {
  if (!node) return undefined

  const uiCfg = getUIConfig(node?.ui)

  const settingsCfg = uiCfg?.settings || {}

  if (_.isString(settingsCfg.cmpt)) {
    settingsCfg.cmpt = { type: settingsCfg.cmpt }
  }

  const config: UISettingsConfig = { ...settingsCfg }

  let formItems = parseDevNodeFormItems([node])
  if (formItems?.items.length) {
    config.form = { ...formItems, ...settingsCfg.form }
  }

  return config
}

/**
 * 解析formItems
 * @param nodes
 * @returns
 */
export function parseDevNodeFormItems(nodes: ZPageDevNode[] | undefined) {
  if (!nodes?.length) return undefined

  const formItems = nodes
    .map(n => {
      return parseDevNodeFormItem(n)
    })
    .filter(it => !!it)

  return { span: 24, items: formItems }
}

/**
 * 解析节点formItem
 * @param node
 * @returns
 */
export function parseDevNodeFormItem(node: ZPageDevNode | undefined) {
  if (!node?.type) return undefined

  let formItem = { type: 'input', default: node.default }

  if (node.type) {
    let itemAttrs: any = { type: '', default: node.default }

    switch (node.type) {
      case 'number':
        itemAttrs.type = 'input-number'
        break
      case 'boolean':
        itemAttrs.type = 'switch'
        break
      case 'array':
        // 字符串数组
        itemAttrs.type = 'select'
        itemAttrs.multiple = true
        itemAttrs.filterable = true
        itemAttrs.allowCreate = true
        itemAttrs.collapseTags = false
        break
      default:
        if (Array.isArray(node?.json?.options)) {
          itemAttrs.type = 'select'
          itemAttrs.options = node?.json?.options
        }
        break
    }

    itemAttrs.type = itemAttrs.type || 'input'

    formItem = { prop: node.name, label: node.label, ...itemAttrs }
  }

  return formItem
}

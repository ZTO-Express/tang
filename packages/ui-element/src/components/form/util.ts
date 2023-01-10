import { _, watch, computed, useAttrs, onBeforeMount, isWidgetEventKey, useCurrentAppInstance } from '@zto/zpage'
import { calcDynamicAttrs, getFormItemRules } from '../../utils/form'
import { getCmptPermData } from '../../utils/app'

import type { PageContext } from '@zto/zpage'
import type { FormItemConfig } from '../../utils/form'

export interface UseFormItemOptions {
  itemType?: string
  customeChangeEvent?: boolean // 自定义onChange事件
  clearModelEmptyPropOnChange?: boolean
  beforeChange?: (value: any, ...args: any[]) => any
}

/** FormItem组件通用方法 */
export function useFormItem(props: any, options?: UseFormItemOptions) {
  const app = useCurrentAppInstance()

  const attrs = useAttrs()

  function handleChange(val: any, ...args: any[]) {
    const context = app.useContext(props.model)

    if (options?.beforeChange) {
      options?.beforeChange(props.model, val, context, ...args)
    }

    // by rayl: 2022-06-06
    // 当前属性为空字符串时清理入参（处理空字符串传入后端因为类型不对报错的情况）
    // 在处理数据导出情况下发现问题
    if (options?.clearModelEmptyPropOnChange) {
      if (props.model[props.prop] === '') {
        props.model[props.prop] = undefined
      }
    }

    const onChange = attrs.onChange || props.onChange
    if (!onChange) return

    onChange(props.model, val, context, ...args)
  }

  if (!options?.customeChangeEvent) {
    watch(
      () => props.model[props.prop],
      (cur, old) => {
        if (cur !== old) {
          handleChange(props.model[props.prop])
        }
      }
    )
  }

  onBeforeMount(() => {
    // 如果model内没有此属性，且有default默认值设置
    // 如果model从接口获取了/主动设置了此属性&值，那么设置的default就无效
    if (!Object.keys(props.model).includes(props.prop) && !_.isNil(attrs.default)) {
      props.model[props.prop] = attrs.default
    }
  })

  const innerAttrs = computed(() => {
    return _.omit(attrs, ['onChange', 'model'])
  })

  const allAttrs = computed(() => {
    return { ...attrs, ...props }
  })

  return { app, handleChange, innerAttrs, allAttrs }
}

/** FormItem计算选项 */
export interface CalcFormItemOptions {
  model: any
  disabled?: boolean
  exFormRules?: any[]
  itemSpan?: number
  itemExpanded?: Record<string, boolean | undefined>
}

/** 计算表单项属性 */
export function calcFormItemAttrs(formItem: any, context: PageContext, options: CalcFormItemOptions) {
  const app = context.app

  const { model, exFormRules, itemSpan } = options

  if (typeof formItem === 'function') formItem = formItem(context)

  if (formItem.dynamicAttrs) {
    const dynamicAttrs = calcDynamicAttrs(formItem.dynamicAttrs, context)

    formItem = _.omit(formItem, ['dynamicAttrs'])
    formItem = _.deepMerge(formItem, dynamicAttrs)
  }

  if (_.isString(formItem.prop)) {
    const propParts = formItem.prop.split('.')

    if (propParts.length > 1) {
      const innerProp = propParts.pop()

      let innerModel = _.get(options.model, propParts)

      if (!innerModel) {
        innerModel = {}
        _.set(options.model, propParts, innerModel)
      }

      formItem.innerProp = innerProp
      formItem.innerModel = innerModel
    }
  }

  normalizeFormItem(formItem)

  const isVisible = isVisibleItem(formItem, context, options)
  const realSpan = isVisible ? formItem.span || itemSpan : 0
  const isDisabled = isDisabledItem(formItem, context, options)
  const isRequired = isRequiredItem(formItem, context, options)

  const itemRules = typeof formItem.rules === 'function' ? formItem.rules(context) : formItem.rules

  let rules =
    getFormItemRules({
      ...formItem,
      rules: itemRules,
      context: { data: model },
      exFormRules
    }) || []

  if (isRequired === false) {
    rules = rules.filter((r: any) => r.ruleName !== 'required')
  }

  const it: any = {}
  // 移除微件事件Key，防止重复计算事件
  Object.keys(formItem).forEach(key => {
    if (!isWidgetEventKey(key)) it[key] = formItem[key]
  })

  const componentType = formItem.componentType ? app.resolveComponent(formItem.componentType) : null
  const componentAttrs = _.omit(it, ['type', 'relatedProps', 'label', 'componentType', 'span'])

  let relatedProps = it.relatedProps

  if (!relatedProps && (it.props || it.labelProps)) {
    relatedProps = it.relatedProps || [...(it.props || []), ...(it.labelProps || [])]
  }

  return {
    ...it,
    relatedProps,
    componentAttrs,
    rules,
    realSpan,
    componentType,
    isDisabled,
    isVisible,
    isRequired
  }
}

/** 是否展示表单 */
function isVisibleItem(item: FormItemConfig, context: PageContext, options: CalcFormItemOptions) {
  const { model } = options
  const itemExpanded = options.itemExpanded || {}

  const app = context.app
  if (!app.checkPermission(item.perm)) return false

  if (item.hidden === true || item.span === 0 || item.type === 'hidden') return false

  const result = app.calcOnExpression(item.visibleOn, model, itemExpanded[item.prop] !== false)
  return result
}

/** 是否disabled */
function isDisabledItem(item: FormItemConfig, context: PageContext, options: CalcFormItemOptions) {
  const { model } = options
  const app = context.app
  if (_.isNil(item.disabledOn)) return options.disabled
  const result = app.calcOnExpression(item.disabledOn, model, item.disabled === true)
  return result
}

/** 是否required */
function isRequiredItem(item: FormItemConfig, context: PageContext, options: CalcFormItemOptions) {
  const { model } = options
  const app = context.app
  if (_.isNil(item.requiredOn)) return undefined
  const result = app.calcOnExpression(item.requiredOn, model, item.required === true)
  return result
}

/**
 * 整理formItem属性
 * 内置组件 已注册过组件 传string类型即可
 * 支持扩展Component itemType传Component对象 - example -  foo: { label:"自定义组件", itemType : ElInput}
 * @param itemType
 */
export function normalizeFormItem(formItem: any) {
  if (!formItem) return formItem
  if (formItem.componentType) return formItem

  let type = formItem.type

  switch (formItem.type) {
    case 'textarea':
      type = 'input'
      formItem.inputType = 'textarea'
      break
    case 'hidden':
      type = 'input'
      formItem.inputType = 'hidden'
      break
  }

  if (typeof type === 'string') {
    formItem.componentType = `c-form-item-${type}`
  } else {
    formItem.componentType = type
  }

  return formItem
}

/** FormAction计算选项 */
export interface CalcFormActionOptions {
  model: any
  disabled?: boolean
}

/** 计算表单活动属性 */
export function calcFormActionAttrs(formAction: any, context: PageContext, options: CalcFormActionOptions) {
  if (typeof formAction === 'function') formAction = formAction(context)

  if (formAction.dynamicAttrs) {
    const dynamicAttrs = calcDynamicAttrs(formAction.dynamicAttrs, context)

    formAction = _.omit(formAction, ['dynamicAttrs'])
    formAction = _.deepMerge(formAction, dynamicAttrs)
  }

  formAction.perm = getCmptPermData(formAction)

  const isVisible = isVisibleItem(formAction, context, options)
  const isDisabled = isDisabledItem(formAction, context, options)

  const it: any = {}
  // 移除微件事件Key，防止重复计算事件
  Object.keys(formAction).forEach(key => {
    if (!isWidgetEventKey(key)) it[key] = formAction[key]
  })

  return {
    ...it,
    isDisabled,
    isVisible
  }
}

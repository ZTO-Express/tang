<template>
  <van-cell-group class="c-form-items" inset>
    <template v-for="(item, index) in innerFormItems" :key="'form-item' + index">
      <slot v-if="item.showSlot || !item.componentType" :name="item.prop" :scope="{ ...item, model }" />
      <van-field
        v-else-if="item.componentType.startsWith('c-form-item-')"
        v-bind="{ ...item.itemAttrs }"
        :name="item.prop"
        :label="item.label"
        :disabled="item.isDisabled"
        :clearable="typeof item.clearable !== 'undefined' ? item.clearable : clearable"
        :input-align="item.inputAlign || 'right'"
        :required="item.isRequired"
        :rules="item.rules"
      >
        <template #input>
          <component
            :is="item.componentType"
            v-bind="{ ...item }"
            :model="model"
            :disabled="item.isDisabled"
            :clearable="typeof item.clearable !== 'undefined' ? item.clearable : clearable"
            :input-align="item.inputAlign || 'right'"
          />
        </template>
      </van-field>
      <component
        v-else
        :is="item.componentType"
        :model="model"
        v-bind="{ ...item, ...item.itemAttrs }"
        :disabled="item.isDisabled"
        :clearable="typeof item.clearable !== 'undefined' ? item.clearable : clearable"
        :required="item.isRequired"
        :rules="item.rules"
      />
    </template>
  </van-cell-group>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { reactive, ref, computed, tpl, _, isWidgetEventKey, useCurrentAppInstance } from '@zto/zpage'

import { getFormItemRules, calcDynamicAttrs } from '../../utils/form'

import CInputField from './CInputField.vue'
import CTextField from './CTextField.vue'

import type { FormItemConfig } from '../../utils/form'

const props = withDefaults(
  defineProps<{
    model: Record<string, any> // 传进来的共享的model表单值对象
    items?: Array<any> | Function // 列表项文件
    disabled?: boolean // 全部禁用
    clearable?: boolean // 全部可清空
    showOperation?: boolean // 显示操作栏
  }>(),
  {
    items: () => [],
    model: () => {
      return {}
    },
    itemWidth: '100%',
    disabled: false,
    clearable: true,
    showOperation: true
  }
)

const app = useCurrentAppInstance()

const formItemsConfig = app.useComponentsConfig('formItems', {})
const exFormRules = app.useComponentsConfig('form.rules')

const context = app.useContext(props.model)

// 所有字段的展开情况
const itemExpanded = reactive<Record<string, boolean>>({})

// 处理过的formItems
const innerFormItems = computed<any>(() => {
  let formItems: FormItemConfig[] = []

  if (typeof props.items === 'function') {
    formItems = (props.items as Function)(context)
  } else {
    formItems = props.items || []
  }

  const items = formItems.map((item: any) => {
    let formItem = item
    if (typeof item === 'function') formItem = item(context)
    if (formItem.dynamicAttrs) {
      const dynamicAttrs = calcDynamicAttrs(formItem.dynamicAttrs, context)
      formItem = _.omit(formItem, ['dynamicAttrs'])
      formItem = _.deepMerge(formItem, dynamicAttrs)
    }

    const componentType = getFormItemComponentType(formItem.type)

    const isVisible = isVisibleItem(formItem)
    const isDisabled = isDisabledItem(formItem)
    const isRequired = isRequiredItem(formItem)

    const itemRules = typeof formItem.rules === 'function' ? formItem.rules(context) : formItem.rules
    let rules =
      getFormItemRules({
        ...formItem,
        rules: itemRules,
        context: { data: props.model },
        exFormRules
      }) || []
    if (!isRequired) {
      rules = rules.filter((r: any) => r.ruleName !== 'required')
    }

    const it: any = {}
    // 移除微件事件Key，防止重复计算事件
    Object.keys(formItem).forEach(key => {
      if (!isWidgetEventKey(key)) it[key] = formItem[key]
    })

    return {
      ...it,
      rules,
      componentType,
      isDisabled,
      isVisible,
      isRequired
    }
  })

  // Warning: 这里可能会影响item的属性模板，暂时先去掉
  // const result = tpl.deepFilter(items, context)

  return items
})

// 获取所有item宽度
const fieldSpan = computed(() => {
  return innerFormItems.value.reduce((acc: number, cur: any) => {
    acc += cur.realSpan
    return acc
  }, 0)
})

/**
 * 操作排列方式
 * 如果 只有一行表单则 靠左排列，多行表单靠右排列
 */
const operationAlign = computed(() => {
  return fieldSpan.value <= 12 ? 'left' : 'right'
})

// 操作排列位置
const operationSpan = computed(() => {
  return 24 - (fieldSpan.value % 24)
})

/**
 * 获取组件类型
 * 内置组件 已注册过组件 传string类型即可
 * 支持扩展Component itemType传Component对象 - example -  foo: { label:"自定义组件", itemType : ElInput}
 * @param itemType
 */
function getFormItemComponentType(type: string | any) {
  type = type || 'input'

  switch (type) {
    case 'input':
    case 'textarea':
    case 'hidden':
      return 'c-input-field'
    case 'text':
    case 'picker':
    case 'date-picker':
      return `c-${type}-field`
    default:
      return `c-form-item-${type}`
  }
}

/** 是否展示表单 */
function isVisibleItem(item: FormItemConfig) {
  if (item.hidden === true || item.type === 'hidden') return false
  if (item.visibleOn) {
    return tpl.evalExpression(item.visibleOn, context) !== false
  } else {
    return itemExpanded[item.prop] !== false
  }
}

/** 是否disabled */
function isDisabledItem(item: FormItemConfig) {
  if (item.disabledOn) {
    return tpl.evalExpression(item.disabledOn, context)
  }

  return item.disabled === true
}

/** 是否required */
function isRequiredItem(item: FormItemConfig) {
  if (item.required === true) return true
  if (item.requiredOn) {
    return tpl.evalExpression(item.requiredOn, context)
  } else {
    return false
  }
}

/** 表单展示变化 */
function toggleExpanded(isExpanded: boolean) {
  for (let item of innerFormItems.value) {
    if (item.collapse) {
      itemExpanded[item.prop] = isExpanded
      continue
    }

    itemExpanded[item.prop] = true
  }
}

defineExpose({
  toggleExpanded
})
</script>

<style lang="scss" scoped>
.c-form-items {
  margin: 0;
}
</style>

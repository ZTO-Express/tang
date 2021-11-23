<template>
  <el-row class="c-form-items" :gutter="$attrs.gutter || 10">
    <!-- 配置item -->
    <template v-for="(item, index) in innerFormItems" :key="'form-item' + index">
      <el-col v-show="item.isShow" class="form-item__con" :span="item.realSpan">
        <el-form-item :label-width="item.labelWidth" :prop="item.prop" :rules="item.rules">
          <template #label>
            <slot v-if="item.showLabelSlot" v-bind="item" :name="item.prop + 'Label'" />
            <span v-else-if="item.label">{{ item.label + ':' }}</span>
            <span v-else></span>
          </template>

          <component
            :is="item.componentType"
            v-if="!item.showSlot && item.type !== 'text'"
            v-bind="{ ...item }"
            :model="model"
            :disabled="item.isDisabled"
            :clearable="typeof item.clearable !== 'undefined' ? item.clearable : clearable"
            :style="{ width: item.width || itemWidth }"
          />

          <span v-else-if="!item.showSlot && item.type === 'text'">
            {{ (item.formatter && item.formatter(model)) || model[item.prop] }}
            <slot v-if="item.prop" :prop="item.prop" name="append" />
          </span>
          <slot v-else v-bind="item" :name="item.prop" />
        </el-form-item>
      </el-col>
    </template>

    <el-col v-if="showOperation" :span="operationSpan">
      <el-form-item label-width="0px">
        <div :class="operationAlign === 'right' ? 'text-right' : ''">
          <slot name="operation"></slot>
        </div>
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue, tpl, useAppContext, useConfig } from '@zto/zpage'

import { getFormItemRules } from './util'

import type { FormItemConfig } from './types'

const { reactive, ref, computed } = vue
const formItemsConfig = useConfig('components.formItems', {})

const props = withDefaults(
  defineProps<{
    model: Record<string, any> // 传进来的共享的model表单值对象
    items?: Array<any> // 列表项文件
    itemWidth?: string // item宽度
    disabled?: boolean // 全部禁用
    clearable?: boolean // 全部可删除
    span?: number // 表单项宽度
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

const context = useAppContext(props.model)

const itemSpan = ref(props.span || formItemsConfig.itemSpan || 12)

const formItems = ref(props.items as FormItemConfig[])

// 所有字段的展开情况
const itemExpanded = reactive<Record<string, boolean>>({})

// 处理过的formItems
const innerFormItems = computed<any>(() => {
  const items = formItems.value.map((item: any) => {
    const rules = getFormItemRules(item) || []
    const isShow = isShowItem(item)
    const realSpan = isShow ? item.span || itemSpan.value : 0
    const componentType = getFormItemComponentType(item.type)
    const isDisabled = isDisabledItem(item)

    return {
      ...item,
      rules,
      isShow,
      realSpan,
      componentType,
      isDisabled
    }
  })

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
  if (type === 'textarea') type = 'input'
  if (type === 'hidden') type = 'input'
  if (typeof type === 'string') return `c-form-item-${type}`
  return type
}

/** 是否展示表单 */
function isShowItem(item: FormItemConfig) {
  if (item.hidden === true || item.span === 0 || item.type === 'hidden') return false
  if (item.visibleOn) {
    return tpl.evalExpression(item.visibleOn, context) !== false
  } else {
    return itemExpanded[item.prop] !== false
  }
}

/** 是否disabled */
function isDisabledItem(item: FormItemConfig) {
  if (item.disabled === true) return true
  if (item.disabledOn) {
    return tpl.evalExpression(item.disabledOn, context)
  } else {
    return false
  }
}

/** 表单展示变化 */
function toggleExpanded(isExpanded: boolean) {
  for (let item of formItems.value) {
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

<style lang="scss">
.c-form-items {
  justify-items: stretch;
  justify-content: space-between;

  @for $i from 1 to 24 {
    &.col-#{$i} {
      grid-template-columns: repeat($i, math.div(100%, $i));
    }
  }
}

.form-item__con {
  padding: 0px;
}
</style>

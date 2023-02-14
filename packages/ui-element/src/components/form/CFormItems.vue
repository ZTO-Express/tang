<template>
  <el-row class="c-form-items" :gutter="$attrs.gutter || 10">
    <div v-if="__showModelData">{{ model }}</div>

    <!-- 配置item -->
    <template v-for="(item, index) in innerFormItems" :key="'form-item' + index">
      <el-col
        v-show="item.isVisible"
        v-bind="item.colAttrs"
        class="form-item__con"
        :class="{ invisible: item.invisible }"
        :span="item.realSpan"
      >
        <!-- 表单项关联属性，清空时同步清空 -->
        <template v-if="item.relatedProps">
          <el-form-item v-for="p in item.relatedProps" v-show="false" :prop="p" :key="p"></el-form-item>
        </template>

        <el-form-item
          v-show="item.visible !== false"
          v-bind="item.itemAttrs"
          :class="{
            'form-item': true,
            'auto-height': item.autoHeight,
            'props-required': item.propsRequired
          }"
          :label-width="item.labelWidth"
          :prop="item.prop"
          :required="item.isRequired"
          :rules="item.rules"
        >
          <template #label>
            <slot v-if="item.showLabelSlot" v-bind="item" :name="item.prop + 'Label'" />
            <template v-else-if="item.label && item.labelWidth !== 0 && item.label !== false">
              <span v-if="typeof item.label === 'string'">
                <span v-if="item.labelTip">
                  {{ item.label }}
                  <el-tooltip class="box-item" effect="dark" :content="item.labelTip" placement="top-start">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  :
                </span>
                <span v-else>{{ item.label + ':' }}</span>
              </span>
              <CFormItemCmpt
                v-else-if="item.labelFormItem?.componentType"
                :config="item.labelFormItem"
                :model="model"
                :clearable="clearable"
                :item-width="itemWidth"
              />
              <span v-else>
                <Content :content="item.label" />
              </span>
            </template>

            <span v-else></span>
          </template>
          <cmpt
            v-if="item.cmpt"
            :config="item.cmpt"
            :context-data="model"
            :disabled="typeof item.isDisabled !== 'undefined' ? item.isDisabled : item.disabled"
            :style="{ width: item.width || itemWidth }"
          />
          <CFormItemCmpt
            v-if="!item.showSlot"
            :config="item"
            :model="model"
            :clearable="clearable"
            :item-width="itemWidth"
          />
          <slot v-else v-bind="item" :name="item.prop" />

          <div v-if="item.tip" class="text-tip">
            <Content :content="item.tip" />
          </div>
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
import { _, reactive, ref, computed, useCurrentAppInstance } from '@zto/zpage'

import type { FormItemConfig } from '../../utils/form'

import _Link from 'element-plus/lib/components/link'
import { QuestionFilled } from '@element-plus/icons'
import CFormItemCmpt from './CFormItemCmpt.vue'
import { calcFormItemAttrs } from './util'

const props = withDefaults(
  defineProps<{
    model?: Record<string, any> // 传进来的共享的model表单值对象
    items?: Array<any> | Function // 列表项文件
    itemWidth?: string // item宽度
    disabled?: boolean // 全部禁用
    clearable?: boolean // 全部可删除
    span?: number // 表单项宽度
    showOperation?: boolean // 显示操作栏
    __showModelData?: boolean // 显示模型数据，一般调试时使用
  }>(),
  {
    items: () => [],
    model: () => ({}),
    itemWidth: '100%',
    disabled: false,
    clearable: true,
    showOperation: true
  }
)

const app = useCurrentAppInstance()

const formItemsConfig = app.useComponentsConfig('formItems', {})
const exFormRules = app.useComponentsConfig('form.rules')

const itemSpan = ref(props.span || formItemsConfig.itemSpan || 12)

// 所有字段的展开情况
const itemExpanded = reactive<Record<string, boolean>>({})

// 处理过的formItems
const innerFormItems = computed<any>(() => {
  const context = app.useContext(props.model)

  let formItems: FormItemConfig[] = []

  if (typeof props.items === 'function') {
    formItems = (props.items as any)(context)
  } else {
    formItems = props.items || []
  }

  const items = formItems.map((item: any) => {
    const formItemAttrs = calcFormItemAttrs(item, context, {
      disabled: props.disabled,
      model: props.model,
      exFormRules,
      itemSpan: itemSpan.value,
      itemExpanded: itemExpanded
    })

    const labelFormItem = formItemAttrs.label?.formItem

    if (labelFormItem) {
      formItemAttrs.labelFormItem = calcFormItemAttrs(labelFormItem, context, {
        disabled: props.disabled,
        model: props.model,
        exFormRules,
        itemSpan: itemSpan.value,
        itemExpanded: itemExpanded
      })
    }

    return formItemAttrs
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

<style lang="scss">
.c-form-items {
  justify-items: stretch;
  // justify-content: space-between;

  .c-form-item {
    width: 100%;
  }
}

.form-item__con {
  padding: 0px;

  // 一般用于跨多行的查询form排版
  &.invisible {
    visibility: hidden;
  }
}

.text-tip {
  line-height: 18px;
}
</style>

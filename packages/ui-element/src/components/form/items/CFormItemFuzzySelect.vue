<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="c-form-item c-form-item-fuzzy-select">
    <el-tooltip placement="top-start" trigger="hover" :disabled="!isShowTips" :content="tipContent">
      <c-fuzzy-select
        ref="fieldRef"
        v-bind="innerAttrs"
        v-model="model[prop]"
        :model-label="labelProp && model[labelProp]"
        :option-data="optionProp && model[optionProp]"
        :label-prop="optionLabelProp"
        :value-prop="optionValueProp"
        :group-prop="optionGroupProp"
        :multiple="multiple"
        :disabled="disabled"
        return-label
        @change="handleChange"
        @update:label="handleUpdateLabelProps"
      />
    </el-tooltip>
    <el-form-item v-show="false" :prop="labelProp"></el-form-item>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, ref, useCurrentAppInstance } from '@zto/zpage'

import { useFormItem } from '../util'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    disabled?: boolean
    labelProp?: string
    optionProp?: string
    optionLabelProp?: string
    optionValueProp?: string
    optionGroupProp?: string
    collapseTags?: boolean
    multiple?: boolean
    showTips?: boolean
  }>(),
  {
    collapseTags: true,
    disabled: false
  }
)

const fieldRef = ref<any>()

const { app, innerAttrs, allAttrs, handleChange } = useFormItem(props, {
  clearModelEmptyPropOnChange: true,
  customeChangeEvent: true
})

// 注册微件事件监听
app.useWidgetEmitter(allAttrs.value, {
  fetchOn: doFetch
})

// 仅多选的时候显示tips，可通过showTips关闭该功能
const isShowTips = computed(() => {
  if (!props.multiple) return false
  if (!fieldRef.value) return false

  if (props.multiple && !getSelectedOptions()?.length) return false
  const { showTips } = props
  // 默认显示
  return typeof showTips === 'boolean' ? showTips : true
})

const tipContent = computed(() => {
  const selectedOptions = getSelectedOptions()
  if (!Array.isArray(selectedOptions)) return ''
  return selectedOptions.map(option => option.currentLabel).join(',')
})

function handleUpdateLabelProps(v: string) {
  if (props.labelProp) {
    // eslint-disable-next-line vue/no-mutating-props
    props.model[props.labelProp] = v
  }
}

function getSelectedOptions() {
  const getSelected = fieldRef.value?.getSelected
  if (!getSelected) return undefined

  const selected = getSelected()
  return selected
}

async function doFetch() {
  await fieldRef.value?.execRemoteMethod()
}
</script>

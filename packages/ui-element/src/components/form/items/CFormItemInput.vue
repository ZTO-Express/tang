<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <el-input
    v-model="model[prop]"
    v-bind="innerAttrs"
    :placeholder="innerAttrs.placeholder || '请输入'"
    :type="inputType || 'text'"
    :disabled="disabled"
    :maxlength="inputMaxlength"
    :show-word-limit="innerShowWordLimit"
  />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { _, watch, computed, useCurrentAppInstance } from '@zto/zpage'

import { useFormItem } from '../util'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    inputType?: string
    disabled?: boolean
    maxlength?: number
    showWordLimit?: boolean
  }>(),
  {
    disabled: false,
    showWordLimit: undefined
  }
)

const app = useCurrentAppInstance()

const inputConfig = app?.useComponentsConfig('formItem.input', {})
const textareaConfig = app?.useComponentsConfig('formItem.textarea', {})

const { innerAttrs } = useFormItem(props)

const inputMaxlength = computed(() => {
  if (props.maxlength) return props.maxlength

  if (props.inputType === 'textarea') return textareaConfig.maxlength || 300
  return inputConfig.maxlength || 100
})

const innerShowWordLimit = computed(() => {
  if (_.isBoolean(props.showWordLimit)) {
    return props.showWordLimit
  }

  // 默认textarea显示字数限制
  if (props.inputType === 'textarea') return true

  return false
})

watch(
  () => props.model[props.prop],
  (cur, old) => {
    if (_.isPlainObjectOrArray(cur)) {
      props.model[props.prop] = JSON.stringify(cur, null, 2)
    }
  },
  {
    immediate: true
  }
)
</script>

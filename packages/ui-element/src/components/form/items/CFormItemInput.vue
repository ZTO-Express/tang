<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <el-input
    v-model="model[prop]"
    v-bind="$attrs"
    :placeholder="$attrs.placeholder || '请输入'"
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
import { _, vue, useConfig } from '@zto/zpage'
const { ref, computed } = vue

const inputConfig = useConfig('components.formItem.input', {})
const textareaConfig = useConfig('components.formItem.textarea', {})

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
</script>

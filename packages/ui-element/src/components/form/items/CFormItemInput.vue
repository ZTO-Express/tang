<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <el-input
    v-model="model[prop]"
    v-bind="$attrs"
    :placeholder="$attrs.placeholder || '请输入'"
    :type="$attrs.type || 'text'"
    :disabled="disabled"
    :maxlength="inputMaxlength"
  />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue, useConfig } from '@zto/zpage'
const { ref } = vue

const inputConfig = useConfig('components.formItem.input', {})

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    disabled?: boolean
    maxlength?: number
  }>(),
  {
    disabled: false
  }
)

const inputMaxlength = ref(props.maxlength || inputConfig.maxlength)
</script>

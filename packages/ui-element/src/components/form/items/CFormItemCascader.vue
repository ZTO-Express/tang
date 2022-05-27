<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <el-cascader
    v-model="model[prop]"
    v-bind="innerAttrs"
    :placeholder="innerAttrs.placeholder || '请选择'"
    :disabled="disabled"
    :options="options || []"
  />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref } from '@zto/zpage'
import { useFormItem } from '../util'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    disabled?: boolean
    options?: Record<string, any>
  }>(),
  {
    disabled: false
  }
)

const { innerAttrs } = useFormItem(props)
</script>

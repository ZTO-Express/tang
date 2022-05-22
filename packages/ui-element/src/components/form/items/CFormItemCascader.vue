<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <el-cascader
    v-model="model[prop]"
    v-bind="$attrs"
    :placeholder="$attrs.placeholder || '请选择'"
    :disabled="disabled"
    :options="options || []"
    @change="handleChange"
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

const { handleChange } = useFormItem(props)
</script>

<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <el-date-picker
    v-model="model[prop]"
    v-bind="$attrs"
    :type="type"
    range-separator="至"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    style="width: 100%"
    :value-format="valueFormat"
    :placeholder="$attrs.placeholder || '选择日期'"
    :disabled="disabled"
    @change="handleChange"
  />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue } from '@zto/zpage'
const { ref } = vue

import type { GenericFunction } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    type?: string
    valueFormat?: string
    disabled?: boolean
    onChange?: GenericFunction
  }>(),
  {
    type: 'date',
    valueFormat: 'YYYY-MM-DD',
    disabled: false
  }
)

function handleChange(payload: any) {
  if (!props.onChange) return
  props.onChange(props.model, payload)
}
</script>

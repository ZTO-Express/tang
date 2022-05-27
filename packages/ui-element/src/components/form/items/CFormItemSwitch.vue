<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-switch v-model="model[prop]" v-bind="innerAttrs" :disabled="disabled" />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { computed } from '@zto/zpage'

import { useFormItem } from '../util'

import type { GenericFunction } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const { innerAttrs } = useFormItem(props)
</script>

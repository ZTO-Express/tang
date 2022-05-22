<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-input-number
    v-model="model[prop]"
    v-bind="$attrs"
    :controls-position="controlsPosition"
    :min="innerMin"
    :max="innerMax"
    :disabled="disabled"
    @change="handleChange"
  />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { computed, useCurrentAppInstance } from '@zto/zpage'

import { useFormItem } from '../util'

import type { GenericFunction } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    controlsPosition: string
    min?: number
    max?: number
    disabled?: boolean
  }>(),
  {
    controlsPosition: 'right',
    disabled: false
  }
)

const app = useCurrentAppInstance()

const inputNumberCfg = app.useComponentsConfig('formItem.inputNumber', {})

const { handleChange } = useFormItem(props)

const innerMin = computed(() => {
  return props.min || inputNumberCfg.min
})

const innerMax = computed(() => {
  return props.max || inputNumberCfg.max
})
</script>

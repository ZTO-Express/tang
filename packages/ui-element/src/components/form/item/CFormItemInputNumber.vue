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
import { vue, useConfig } from '@zpage/zpage'
const { computed } = vue

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    controlsPosition: string
    min?: number
    max?: number
    disabled?: boolean
    onChange?: GenericFunction
  }>(),
  {
    default: 'right',
    disabled: false
  }
)

const inputNumberCfg = useConfig('components.formItem.inputNumber', {})

const innerMin = computed(() => {
  return props.min || inputNumberCfg.min
})

const innerMax = computed(() => {
  return props.max || inputNumberCfg.max
})

function handleChange(payload: any) {
  if (!props.onChange) return
  props.onChange(props.model, payload)
}
</script>

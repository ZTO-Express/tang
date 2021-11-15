<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-switch v-model="model[prop]" v-bind="$attrs" :disabled="disabled" @change="handleChange" />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue } from '@zpage/zpage'

const { computed } = vue

const props = withDefaults(
  defineProps<{
    model: GenericObject
    prop: string
    disabled?: boolean
    onChange?: GenericFunction
  }>(),
  {
    disabled: false
  }
)

function handleChange(payload: any) {
  if (!props.onChange) return
  props.onChange(props.model, payload)
}
</script>

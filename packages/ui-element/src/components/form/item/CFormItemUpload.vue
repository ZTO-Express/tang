<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <c-upload v-model="model[prop]" v-bind="$attrs" :disabled="disabled" />
  {{ model[prop] }}
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue } from '@zto/zpage'
const { ref } = vue

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    nameProp: string
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)
</script>

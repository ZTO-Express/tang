<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="text" v-bind="$attrs" :style="style">{{ displayText }}</div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { tpl, useAppContext, vue, _ } from '@zto/zpage'

import type { GenericFunction } from '@zto/zpage'

const { computed } = vue

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    tpl?: string
    html?: string
    formatter?: GenericFunction
    emptyText?: string
    style?: Record<string, any>
  }>(),
  {
    emptyText: '--'
  }
)

const displayText = computed(() => {
  let text = props.model[props.prop]

  if (props.formatter) {
    return props.formatter(text, props.model)
  }

  if (props.tpl) {
    const context = useAppContext(props.model)
    text = tpl.filter(props.tpl, context)
  }

  if (props.emptyText && _.isEmpty(text)) {
    return props.emptyText
  }

  return text
})
</script>

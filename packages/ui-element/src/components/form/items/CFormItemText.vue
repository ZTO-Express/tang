<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="text" v-bind="$attrs" :style="style">{{ displayText }}</div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { tpl, useCurrentAppInstance, computed, _, formatText } from '@zto/zpage'

import type { GenericFunction } from '@zto/zpage'
import { useFormItem } from '../util'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    tpl?: string
    html?: string
    formatter?: string | Record<string, any> | GenericFunction
    emptyText?: string
    style?: Record<string, any>
  }>(),
  {
    emptyText: '--'
  }
)

const app = useCurrentAppInstance()

useFormItem(props)

const displayText = computed(() => {
  let text = props.model[props.prop]

  if (props.formatter) {
    text = app.formatText(text, props.formatter, { model: props.model })
  } else if (props.tpl) {
    text = app.filter(props.tpl, props.model)
  }

  if (props.emptyText && _.isEmpty(text)) {
    return props.emptyText
  }

  return text
})
</script>

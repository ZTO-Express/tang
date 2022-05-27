<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="c-form-item c-form-item-file-list">
    <c-file-list v-if="fileItems?.length" :model-value="fileItems" v-bind="innerAttrs" />
    <div v-else>{{ emptyText }}</div>
    <div v-if="title" class="title">{{ title }}</div>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { _, computed, ref } from '@zto/zpage'

import { useFormItem } from '../util'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    title?: string
    emptyText?: string
  }>(),
  {
    emptyText: '--'
  }
)
const { innerAttrs } = useFormItem(props)

const fileItems = computed(() => {
  const val = props.model[props.prop]
  if (!val) return []
  if (typeof val === 'string') {
    return val.split(',')
  } else {
    return val
  }
})
</script>

<style lang="scss" scoped>
.c-form-item-image {
  padding: 5px;
  text-align: center;
}
</style>

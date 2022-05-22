<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="c-form-item-image">
    <c-image :src="model[prop]" v-bind="$attrs" @change="handleChange" />
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
  }>(),
  {}
)

const { handleChange } = useFormItem(props)
</script>

<style lang="scss" scoped>
.c-form-item-image {
  padding: 5px;
  text-align: center;
}
</style>

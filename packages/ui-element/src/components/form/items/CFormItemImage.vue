<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="c-form-item-image">
    <c-image :src="model[prop]" v-bind="$attrs" />
    <div v-if="title" class="title">{{ title }}</div>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { _, vue } from '@zto/zpage'

const { computed, ref } = vue

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    title?: string
  }>(),
  {}
)
</script>

<style lang="scss" scoped>
.c-form-item-image {
  padding: 5px;
  text-align: center;
}
</style>

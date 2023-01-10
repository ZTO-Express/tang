<template>
  <div class="c-table-header-cell">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { App } from '@zto/zpage'

// 属性
const props = withDefaults(
  defineProps<{
    app: App
    scope: Record<string, any>
    config?: Record<string, any> | Function | string
  }>(),
  {}
)
</script>

<style lang="scss" scoped>
.c-table-header-cell {
  display: inline-block;
}
</style>

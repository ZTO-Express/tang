<template>
  <div class="c-doc-code">
    文档编码
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, useCurrentAppInstance } from '@zto/zpage'
</script>

<style lang="scss" scoped></style>

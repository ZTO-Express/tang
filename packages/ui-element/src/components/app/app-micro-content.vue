<template>
  <div :id="MICRO_PAGE_CONTENT_DOM_ID" class="app-micro-content fs">微前端应用</div>
</template>

<script setup lang="ts">
import { MICRO_PAGE_CONTENT_DOM_ID } from '@zto/zpage'
</script>

<style lang="scss" scoped>
.app-micro-content {
  padding: 10px;
  box-sizing: border-box;
}
</style>

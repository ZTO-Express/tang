<template>
  <c-page class="page-index">
    <c-page-section class="title-section flex-center">
      <img v-if="welcomePic" :src="welcomePic" />
      <h1 v-else class="title">{{ title }}</h1>
    </c-page-section>
  </c-page>
</template>

<script setup lang="ts">
import { vue, useConfig } from '@zto/zpage'
const { computed } = vue

const config = useConfig('app')
const title = config.title

const welcomePic = computed(() => {
  return config.assets?.welcomePic || config.assets?.logo
})
</script>

<style lang="scss" scoped>
.page-index {
  padding: 50px;
  text-align: center;
}

.title-section {
  height: 300px;

  .title {
    font-size: 30px;
    opacity: 0.6;
  }

  img {
    height: 100px;
    opacity: 0.8;
  }
}
</style>

<template>
  <c-page class="page-index">
    <c-page-section class="title-section flex-center">
      <img v-if="picture" :src="picture" />
      <h1 v-if="title" class="title">{{ title }}</h1>
    </c-page-section>
  </c-page>
</template>

<script setup lang="ts">
import { computed, useCurrentAppInstance } from '@zto/zpage'

const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()

const wSchema = app.useWidgetSchema(props.schema)

const appConfig = app.useAppConfig()
const imageAssets = app.useAssets('images', {})

const title = computed(() => {
  if (wSchema.title === false) return null

  return wSchema.title || appConfig.title
})

const picture = computed(() => {
  if (wSchema.picture === false) return null

  return wSchema.picture || imageAssets.welcome || imageAssets.logo
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

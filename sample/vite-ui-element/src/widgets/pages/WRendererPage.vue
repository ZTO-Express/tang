<template>
  <c-page class="w-renderer-page" :fixed="false">
    <div class="w-renderer-page__body">
      <div id="app-renderer"></div>
      <slot />
    </div>
  </c-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore, useWidgetSchema, useRenderer } from '@zpage/zpage'

const store = useStore()

const renderer = useRenderer()

// 属性
const props = defineProps<{
  schema: GenericObject
}>()

const wSchema = await useWidgetSchema(props.schema)

const currentApp = computed(() => {
  return store.getters.app?.currentApp
})
</script>

<style lang="scss" scoped>
.w-renderer-page {
  &__body {
    height: 100%;
    margin-top: $section-gutter;
  }
}

</style>

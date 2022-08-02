<template>
  <c-page class="w-doc-page">
    <div class="page__body">
      <c-doc-outline v-if="isMarkdownDoc">
        <h1>{{ pageTitle }}</h1>
        <component ref="mdComponentRef" :is="mdComponent" />
      </c-doc-outline>
      <widget v-else-if="bodySchema" :schema="bodySchema" />
    </div>
  </c-page>
</template>

<script setup lang="ts">
import { _, ref, computed, useCurrentAppInstance } from '@zto/zpage'

import type { PageSchema } from '@zto/zpage'

// 属性
const props = defineProps<{
  schema: PageSchema
}>()

const mdComponentRef = ref<any>()

const app = useCurrentAppInstance()

const wSchema = app.useWidgetSchema(props.schema || {})

const sBody = app.useWidgetSchema(wSchema.value?.body)

const mdComponent = wSchema.markdown?.cmpt

const routeMeta = computed(() => {
  return app.currentRoute.value?.meta
})

const pageTitle = computed(() => {
  return wSchema.title || routeMeta?.value.label
})

const isMarkdownDoc = computed(() => {
  return !!mdComponent
})

/** 数据查看类型 */
const bodySchema = computed(() => {
  if (!sBody) return null

  let bSchema = { ...sBody }

  return bSchema
})
</script>

<style lang="scss" scoped>
h1 {
  font-size: 1.8rem;
}

.page__body {
  padding: 5px 10px;
  background: var(--bg-color);
}
</style>

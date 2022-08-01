<template>
  <c-page class="w-doc-page">
    <template #header>
      <c-page-header v-bind="headerAttrs" :title="wSchema.title">
        <template #extra></template>
      </c-page-header>
    </template>
    <div class="w-doc-page__body fs">
      <component v-if="mdComponent" :is="mdComponent" />
      <widget v-else-if="bodySchema" :schema="bodySchema" />
      <!-- <slot /> -->
    </div>
  </c-page>
</template>

<script setup lang="ts">
import { _, computed, useCurrentAppInstance } from '@zto/zpage'

import type { PageSchema } from '@zto/zpage'

// 属性
const props = defineProps<{
  schema: PageSchema
}>()

const app = useCurrentAppInstance()

const wSchema = app.useComputedWidgetSchema(props.schema || {})

const sBody = app.useComputedWidgetSchema(wSchema.value?.body)

/** 头部属性 */
const headerAttrs = computed(() => {
  return { ...wSchema.value?.header }
})

const mdComponent = computed(() => {
  return wSchema.value?.markdown?.cmpt
})

/** 数据查看类型 */
const bodySchema = computed(() => {
  if (!sBody.value) return null

  let bSchema = { ...sBody.value }

  return bSchema
})
</script>

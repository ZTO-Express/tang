<template>
  <c-page class="w-analysis-page" :fixed="false">
    <template #header>
      <c-page-header :title="wSchema.title">
        <template #extra>
          <c-analysis-date @change="handleDateChange" />
        </template>
      </c-page-header>
    </template>
    <div class="w-analysis-page__body">
      <slot />
    </div>
  </c-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore, useWidgetSchema } from '@zpage/zpage'

const store = useAppStore()

// 属性
const props = defineProps<{
  schema: Record<string, any>
}>()

const wSchema = await useWidgetSchema(props.schema)

const sChart = await useWidgetSchema(wSchema.chart || {})

const currentApp = computed(() => {
  return store.getters.app?.currentApp
})

const chartAttrs = computed(() => {
  const options = sChart
  return { options }
})

function handleDateChange(payload: any) {
  setAnalysisDateRange(payload)
}

/**
 * 设置当前应用
 */
async function setAnalysisDateRange(payload: any) {
  const { from, to } = payload || {}

  if (!from || !to) return

  await store.dispatch('pages/setPageData', {
    data: { startDate: from, endDate: to }
  })
  return currentApp
}
</script>

<style lang="scss" scoped>
.w-analysis-page {
  &__body {
    height: 100%;
    margin-top: $section-gutter;
  }

  .chart-con {
    padding: 10px 0;
    border-bottom: 1px dashed $border-color;
  }
}

.app-selector-item {
  margin: 5px;
}
</style>

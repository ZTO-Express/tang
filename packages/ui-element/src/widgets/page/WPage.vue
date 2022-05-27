<template>
  <c-page :meta="pageMeta" :header-height="headerHeight" :no-header="!isHeader">
    <template v-if="isHeader" #header>
      <c-page-header v-bind="headerAttrs" />
    </template>
    <template v-if="isToolbar" #toolbar>
      <c-page-tabs v-if="isTab" :model-value="innerTabValue" :tab-items="tabItems" @change="handlePageTabChange" />
    </template>
    <slot />
  </c-page>
</template>

<script setup lang="ts">
import { computed, ref, tpl, useCurrentAppInstance } from '@zto/zpage'

const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()

const pageCfg = app.useWidgetsConfig('page', {})

const wSchema = app.useWidgetSchema(props.schema)
const cTabs = app.useWidgetSchema(wSchema.tabs)

const router = app.router

// ---- page相关 ----->
const pageMeta = computed(() => {
  return {
    initData: wSchema.data,
    ...wSchema.meta
  }
})

// ---- header相关 ----->

const isToolbar = computed(() => {
  return isTab.value
})

const isHeader = computed(() => {
  if (wSchema.noHeader === false) return false
  return wSchema.noHeader !== true && pageCfg.noHeader !== true
})

const headerHeight = computed(() => {
  return isToolbar.value ? '80px' : '38px'
})

const headerAttrs = computed(() => {
  return { ...wSchema.header, noBack: wSchema.noBack === true }
})

// ---- tab相关 ----->

const tabValue = ref<string>(cTabs?.value)

const tabItems = computed(() => {
  return cTabs?.items || []
})

const isTab = computed(() => {
  return !!tabItems.value?.length
})

const innerTabValue = computed(() => {
  return app.filter(tabValue.value)
})

async function handlePageTabChange(tabItem: any) {
  if (!tabItem || !tabItem.value) return

  tabValue.value = tabItem.value

  if (tabItem.link) {
    await router.goto(tabItem.link)
  }
}
</script>

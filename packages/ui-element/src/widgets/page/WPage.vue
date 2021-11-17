<template>
  <c-page :header-height="headerHeight" :no-header="!isHeader">
    <template v-if="isHeader" #header>
      <c-page-header v-bind="headerAttrs" />
    </template>
    <template v-if="isToolbar" #toolbar>
      <c-page-tabs
        v-if="isTab"
        :model-value="innerTabValue"
        :tab-items="tabItems"
        @change="handlePageTabChange"
      />
    </template>
    <slot />
  </c-page>
</template>

<script setup lang="ts">
import { vue, tpl, useAppRouter, useAppContext, useWidgetSchema, useConfig } from '@zpage/zpage'

const { computed, ref } = vue

const router = useAppRouter()

const props = defineProps<{
  schema: Record<string, any>
}>()

const wSchema = await useWidgetSchema(props.schema)

const cTabs = await useWidgetSchema(wSchema.tabs)

const context = useAppContext()

const pageCfg = useConfig('widgets.page')

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
  return Object.assign({}, wSchema.header, {
    noBack: wSchema.noBack === true
  })
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
  return tpl.filter(tabValue.value, context)
})

async function handlePageTabChange(tabItem: any) {
  if (!tabItem || !tabItem.value) return

  tabValue.value = tabItem.value

  if (tabItem.link) {
    await router.goto(tabItem.link)
  }
}
</script>
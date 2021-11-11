<template>
  <c-page :header-height="headerHeight">
    <template #header>
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
import { computed, ref } from 'vue'
import { tpl, useRouter, useAppContext, useWidgetSchema } from 'zpage'

const router = useRouter()

const props = defineProps<{
  schema: GenericObject
}>()

const wSchema = await useWidgetSchema(props.schema)

const cTabs = await useWidgetSchema(wSchema.tabs)

const context = useAppContext()

// ---- header相关 ----->

const isToolbar = computed(() => {
  return isTab.value
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

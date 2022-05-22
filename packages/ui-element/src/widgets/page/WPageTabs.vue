<template>
  <c-page-tabs v-model="tabName" class="w-page-tabs" show-pane :tab-items="tabItems" @change="handleChange">
    <template #default="item">
      <widget :schema="item.body" />
    </template>
  </c-page-tabs>
</template>

<script setup lang="ts">
import { computed, ref, tpl, useCurrentAppInstance } from '@zto/zpage'
import { UI_GLOBAL_EVENTS } from '../../consts'

const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()

const emitter = app.emitter
const wSchema = app.useWidgetSchema(props.schema)
const cTabItems = app.useWidgetSchema(wSchema.items)

// ---- tab相关 ----->
const defaultTabName = app.filter(wSchema.default)

const tabName = ref<string>(defaultTabName)

const tabItems = computed(() => {
  return cTabItems || []
})

// 触发页面Tab变化全局事件
function handleChange(item: any) {
  emitter.emit(UI_GLOBAL_EVENTS.PAGE_TAB_CHANGE, {
    name: wSchema.name,
    tabItem: item
  })
}
</script>

<style lang="scss" scoped>
.w-page-tabs {
  height: 100%;
}
</style>

<template>
  <c-page-tabs v-model="tabName" class="w-page-tabs" show-pane :tab-items="tabItems">
    <template #default="item">
      <widget :schema="item.body" />
    </template>
  </c-page-tabs>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { tpl, useAppContext, useWidgetSchema } from '@zpage/zpage'

const props = defineProps<{
  schema: GenericObject
}>()

const wSchema = await useWidgetSchema(props.schema)

const cTabItems = await useWidgetSchema(wSchema.items)

const context = useAppContext()

// ---- tab相关 ----->

const defaultTabName = tpl.filter(wSchema.default, context)

const tabName = ref<string>(defaultTabName)

const tabItems = computed(() => {
  return cTabItems || []
})
</script>

<style lang="scss" scoped>
.w-page-tabs {
  height: 100%;
}
</style>

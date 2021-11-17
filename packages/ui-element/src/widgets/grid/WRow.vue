<template>
  <el-row v-bind="rowAttrs">
    <slot />
  </el-row>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue, _, useWidgetSchema } from '@zpage/zpage'
const { computed } = vue

// 属性
const props = defineProps<{
  schema: Record<string, any>
}>()

const wSchema = await useWidgetSchema(props.schema)

const rowAttrs = computed(() => {
  const gutter = wSchema.gutter || 10
  const attrs = _.omit(wSchema, ['type', 'body'])
  return {
    ...attrs,
    gutter
  }
})
</script>

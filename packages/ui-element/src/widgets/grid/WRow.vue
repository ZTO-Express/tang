<template>
  <el-row v-bind="rowAttrs">
    <slot />
  </el-row>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { computed, _, useCurrentAppInstance } from '@zto/zpage'

// 属性
const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()

const wSchema = app.useWidgetSchema(props.schema)

const rowAttrs = computed(() => {
  const gutter = wSchema.gutter || 10
  const attrs = _.omit(wSchema, ['type', 'body'])
  return {
    ...attrs,
    gutter
  }
})
</script>

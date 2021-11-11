<template>
  <el-row v-bind="rowAttrs">
    <slot />
  </el-row>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { _, useWidgetSchema } from 'zpage'

// 属性
const props = defineProps<{
  schema: GenericObject
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

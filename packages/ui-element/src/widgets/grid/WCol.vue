<template>
  <el-col v-bind="colAttrs">
    <slot />
  </el-col>
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

const colAttrs = computed(() => {
  return _.omit(wSchema, ['type', 'body'])
})
</script>

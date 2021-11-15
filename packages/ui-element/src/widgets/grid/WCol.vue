<template>
  <el-col v-bind="colAttrs">
    <slot />
  </el-col>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue, _, useWidgetSchema } from '@zpage/zpage'

const { computed } = vue

// 属性
const props = defineProps<{
  schema: GenericObject
}>()

const wSchema = await useWidgetSchema(props.schema)

const colAttrs = computed(() => {
  return _.omit(wSchema, ['type', 'body'])
})
</script>

<template>
  <c-page-section v-bind="sectionAttrs">
    <slot />
  </c-page-section>
</template>

<script setup lang="ts">
import { vue, _, useWidgetSchema } from '@zto/zpage'
const { computed } = vue

const props = defineProps<{
  schema: Record<string, any>
}>()

const wSchema = useWidgetSchema(props.schema)

const sectionAttrs = computed(() => {
  const _attrs = _.omit(wSchema, ['type', 'body'])
  return _attrs
})
</script>

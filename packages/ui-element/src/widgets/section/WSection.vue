<template>
  <c-page-section v-bind="sectionAttrs">
    <slot />
  </c-page-section>
</template>

<script setup lang="ts">
import { vue, _, useWidgetSchema } from '@zpage/zpage'
const { computed } = vue

const props = defineProps<{
  schema: GenericObject
}>()

const wSchema = await useWidgetSchema(props.schema)

const sectionAttrs = computed(() => {
  const _attrs = _.omit(wSchema, ['type', 'body'])
  return _attrs
})
</script>

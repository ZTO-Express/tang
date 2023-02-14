<template>
  <c-divider v-bind="divideAttrs">
    <slot />
  </c-divider>
</template>

<script setup lang="ts">
import { computed, _, useCurrentAppInstance } from '@zto/zpage'

const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()

const wSchema = app.useWidgetSchema(props.schema)

const divideAttrs = computed(() => {
  const _attrs = _.omit(wSchema, ['type', 'body'])
  return _attrs
})
</script>

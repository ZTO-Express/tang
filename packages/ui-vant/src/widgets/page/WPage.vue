<template>
  <c-page>
    <slot />
  </c-page>
</template>

<script setup lang="ts">
import { useCurrentAppInstance } from '@zto/zpage'

const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()

const wSchema = app.useWidgetSchema(props.schema)
</script>

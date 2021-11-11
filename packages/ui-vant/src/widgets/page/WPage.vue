<template>
  <c-page>
    <slot />
  </c-page>
</template>

<script setup lang="ts">
import { useWidgetSchema } from '@zto/zpage'

const props = defineProps<{
  schema: GenericObject
}>()

const wSchema = await useWidgetSchema(props.schema)
</script>

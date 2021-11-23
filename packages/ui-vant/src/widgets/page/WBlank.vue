<template>
  <c-page>
    <div>未找到页面配置</div>
  </c-page>
</template>

<script setup lang="ts">
import { vue, useWidgetSchema } from '@zto/zpage'

const { ref } = vue

const props = defineProps<{
  schema: Record<string, any>
}>()

// schema
const wSchema = await useWidgetSchema(props.schema)
</script>

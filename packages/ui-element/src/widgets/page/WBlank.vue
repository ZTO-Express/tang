<template>
  <c-page>
    <div>未找到页面配置</div>
  </c-page>
</template>

<script setup lang="ts">
import { useWidgetSchema } from '@zto/zpage'

const props = defineProps<{
  schema: Record<string, any>
}>()

// schema
const wSchema = useWidgetSchema(props.schema)
</script>

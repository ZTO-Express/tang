<template>
  <c-page>
    <div>未找到页面配置</div>
  </c-page>
</template>

<script setup lang="ts">
import { ref, useCurrentAppInstance } from '@zto/zpage'

const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()

// schema
const wSchema = app.useWidgetSchema(props.schema)
</script>

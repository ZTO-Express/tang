<template>
  <c-page>
    <div>未找到页面配置</div>
  </c-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWidgetSchema } from '@zpage/zpage'

const props = defineProps<{
  schema: GenericObject
}>()

// schema
const wSchema = await useWidgetSchema(props.schema)
</script>

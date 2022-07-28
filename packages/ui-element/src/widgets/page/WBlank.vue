<template>
  <c-page>
    <div v-if="error">{{ error.message || '加载页面错误' }}</div>
    <div v-else>未找到页面配置</div>
  </c-page>
</template>

<script setup lang="ts">
import { computed, ref, tpl, useCurrentAppInstance } from '@zto/zpage'

const props = defineProps<{
  schema: Record<string, any>
}>()

/** 获取页面错误 */
const error = computed(() => {
  return props.schema.error
})
</script>

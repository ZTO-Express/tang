<template>
  <c-action ref="actionRef" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { vue, useWidgetEmitter, useWidgetSchema } from '@zto/zpage'

const { ref } = vue

// 属性
const props = defineProps<{
  schema: Record<string, any>
}>()

// schema
const wSchema = await useWidgetSchema(props.schema)

// 注册微件事件监听
useWidgetEmitter(wSchema, {
  triggerOn: doTrigger
})

const actionRef = ref<any>()

// 执行数据加载
async function doTrigger() {
  actionRef.value?.trigger()
}
</script>

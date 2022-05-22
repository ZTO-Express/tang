<template>
  <c-action ref="actionRef" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { ref, useCurrentAppInstance } from '@zto/zpage'

// 属性
const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()

const wSchema = app.useWidgetSchema(props.schema)

// 注册微件事件监听
app.useWidgetEmitter(wSchema, {
  triggerOn: doTrigger
})

const actionRef = ref<any>()

// 执行数据加载
async function doTrigger() {
  actionRef.value?.trigger()
}
</script>

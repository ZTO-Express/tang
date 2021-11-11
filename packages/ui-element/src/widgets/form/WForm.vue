<template>
  <c-form v-bind="formAttrs" :model="formModel">
    <c-form-items v-bind="formItemsAttrs" :model="formModel" :items="formItems" />
  </c-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { tpl, useApiRequest, useAppContext, useWidgetEmitter, useWidgetSchema } from '@zpage/zpage'

// 属性
const props = defineProps<{
  schema: GenericObject
}>()

// api请求
const apiRequest = useApiRequest()

// 表单模型
const formModel = ref<any>({})

// 应用上下文
const context = useAppContext(formModel)

// schema
const wSchema = await useWidgetSchema(props.schema)

// 注册微件事件监听
useWidgetEmitter(wSchema, {
  fetchOn: doFetch
})

// ----- 表单相关 ----->

const formItems = wSchema.formItems

const formAttrs = computed(() => {
  const formAttrs = wSchema.innerAttrs?.form || {}

  return { ...formAttrs }
})

const formItemsAttrs = computed(() => {
  const formItemsAttrs = wSchema.innerAttrs?.formItems || {}

  return { ...formItemsAttrs }
})

// ----- 查询相关 ----->

const sFetch = wSchema.fetch

if (sFetch) {
  doFetch()
}

// 执行数据加载
async function doFetch() {
  if (!sFetch) return

  const payload = tpl.deepFilter(
    {
      action: sFetch.api,
      ...sFetch
    },
    context
  )

  formModel.value = await apiRequest(payload)
}
</script>

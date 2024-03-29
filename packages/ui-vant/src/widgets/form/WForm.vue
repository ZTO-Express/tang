<template>
  <c-form ref="formRef" v-bind="formAttrs" :model="formModel">
    <c-form-items v-bind="formItemsAttrs" :model="formModel" :items="formItems" />
  </c-form>
</template>

<script setup lang="ts">
import { computed, ref, tpl, useCurrentAppInstance } from '@zto/zpage'

// 属性
const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()

// api请求
const apiRequest = app.request

// schema
const wSchema = app.useWidgetSchema(props.schema)

// 加载项
const loading = ref<any>({})

// 注册微件事件监听
app.useWidgetEmitter(wSchema, {
  fetchOn: doFetch,
  resetOn: doReset
})

const formRef = ref<any>()

// ----- 表单相关 ----->

const sModel = wSchema.model || {}

// 表单模型
const formModel = ref<any>(sModel)

// 应用上下文
const context = app.useContext(formModel)

const formItems = wSchema.formItems

const formAttrs = computed(() => {
  const formAttrs = wSchema.innerAttrs?.form || {}
  const formActions = wSchema.actions || []
  return { ...formAttrs, actions: formActions }
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

// 重设
function doReset() {
  formRef.value.resetValidation()
}

// --------- 操作相关 ------>
</script>

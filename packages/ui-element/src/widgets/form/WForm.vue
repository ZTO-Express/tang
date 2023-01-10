<template>
  <c-form
    ref="formRef"
    class="w-form"
    v-loading="loading"
    v-bind="formAttrs"
    :actions="innerFormActions"
    :model="formModel"
  >
    <c-form-items v-bind="formItemsAttrs" :model="formModel" :items="formItems" />
  </c-form>
</template>

<script setup lang="ts">
import { _, computed, ref, onMounted, useCurrentAppInstance } from '@zto/zpage'
import { appUtil } from '../../utils'

import type { PageContext } from '@zto/zpage'

// 属性
const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()

// schema
const wSchema = app.useWidgetSchema(props.schema)

// 活动 schema
const sActions = app.useWidgetSchema(wSchema.actions || {})

// 加载项
const loading = ref<boolean>(false)

// 注册微件事件监听
app.useWidgetEmitter(wSchema, {
  fetchOn: doFetch,
  resetOn: doReset
})

const formRef = ref<any>()

// ----- 表单相关 ----->

const sModel = wSchema.model || {}

const fetchData = ref<any>()

// 表单模型
const formModel = ref<any>(sModel)

// 组件上下文数据
const innerContextData = computed(() => {
  return {
    fetchData: fetchData.value, // 上下文
    model: formModel.value // 查询结果
  }
})

const formItems = wSchema.formItems
const formActions = wSchema.formActions

const formAttrs = computed(() => {
  const formAttrs = wSchema.formAttrs || wSchema.innerAttrs?.form || {}

  return { afterSubmit: afterSubmitMethod, ...formAttrs }
})

const innerFormActions = computed(() => {
  const actions = _.omit(wSchema.actions || {}, 'fetch')

  if (actions.submit) {
    actions.submit = { ...actions.submit, payload: getFormPayload(actions.submit) }
  }

  actions.reload = { label: '重新加载', buttonType: 'plain', trigger: doReload, ...actions.reload }

  let _formActions: any[] = []

  if (!formActions) {
    _formActions = Object.entries(actions).map(([key, value]) => {
      return { name: key, ...((value || {}) as any) }
    })
  } else {
    _formActions = formActions
      .filter(it => it.action)
      .map(it => {
        const _it = _.omit(it, 'action')
        const _action = _.deepMerge(actions[it.action], _it, { name: it.action })
        return _action
      })
  }

  return _formActions
})

const formItemsAttrs = computed(() => {
  const formItemsAttrs = wSchema.formItemsAttrs || wSchema.innerAttrs?.formItems || {}

  return { showOperation: false, ...formItemsAttrs }
})

// ----- 生命周期相关 ----->

onMounted(async () => {
  // 立即查询
  if (sActions.fetch?.immediate !== false) {
    await doFetch()
  }
})

// ----- 操作相关 ----->

// 执行数据加载
async function doFetch() {
  const context = app.useContext(innerContextData.value)

  const fetchAction = sActions.fetch || {}

  if (fetchAction.trigger) {
    const result = Promise.resolve().then(() => fetchAction.trigger(context))
    return result
  }

  if (!fetchAction.api) {
    formModel.value = { ...fetchAction.data }
    return
  }

  const apiParams = app.deepFilter(fetchAction?.apiParams, context)
  const extData = app.deepFilter(fetchAction?.extData, context)

  let postParams = _.deepMerge(extData, apiParams)
  postParams = _.shallowTrim(postParams) // 清理查询空格

  loading.value = true

  fetchData.value = await app
    .request({
      action: { ...fetchAction },
      params: postParams
    })
    .finally(() => {
      loading.value = false
    })

  if (fetchAction.payload) {
    const fetchContext = app.useContext(fetchData.value)
    formModel.value = appUtil.getActionPayload(fetchAction.payload, fetchContext)
  } else {
    formModel.value = fetchData.value
  }
}

// 重新加载数据
async function doReload(action: any) {
  await doFetch()

  if (action?.successMessage !== false) {
    app.ui.showMessage({
      type: 'success',
      message: action?.successMessage || `${action.label}成功`
    })
  }
}

// 重设
function doReset() {
  formRef.value.resetFields()
}

function afterSubmitMethod(context: PageContext, action: any) {
  if (action?.successMessage !== false) {
    app.ui.showMessage({
      type: 'success',
      message: action?.successMessage || '提交成功！'
    })
  }

  doFetch()
}

/** 获取form */
function getFormPayload(submitAction: any) {
  if (_.isFunction(submitAction.payload)) {
    return () => {
      const payloadContext = app.useContext({ ...innerContextData.value, modelData: formModel.value })
      return submitAction.payload(payloadContext)
    }
  }

  return submitAction?.payload
}
</script>

<style lang="scss" scoped>
.w-form {
  padding: 16px;
  box-sizing: border-box;
}
</style>

<template>
  <el-form ref="formRef" v-bind="$attrs" :model="dataModel" :label-width="innerLabelWidth">
    <slot />

    <div v-if="innerActions.length" class="form-footer">
      <template v-for="it in innerActions" :key="it.name">
        <el-button
          v-if="it.name === 'submit' || it.actionType === 'submit'"
          class="q-mr-md"
          :loading="loading"
          type="primary"
          @click="handleSubmit(it)"
        >
          {{ it.label || '保存' }}
        </el-button>
        <c-action
          v-else
          v-bind="it"
          class="q-mr-md"
          :before-trigger="handleActionBeforeTrigger(it)"
          :after-trigger="handleActionAfterTrigger(it)"
          :context-data="dataModel"
        />
      </template>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { vue, tpl, useConfig, useAppContext, useApiRequest } from '@zto/zpage'
import { useMessage } from '../../composables'

const { computed, ref } = vue

const formConfig = useConfig('components.form', {})

const props = defineProps<{
  labelWidth?: number | string
  actions?: any[]
  model?: Record<string, any>
  beforeSubmit?: Function
  afterSubmit?: Function
}>()

const { Message } = useMessage()
const apiRequest = useApiRequest()

const formRef = ref<any>()

// ----- 数据相关 ----->

const dataModel = ref<any>(props.model || {})
const context = useAppContext(dataModel)

function setData(data: any) {
  dataModel.value = data
}

// ----- 表单相关 ----->

const innerLabelWidth = computed(() => {
  return props.labelWidth || formConfig.labelWidth || 80
})

function validate(...args: any[]) {
  return formRef.value.validate(...args)
}

function resetFields() {
  return formRef.value.resetFields()
}

// --------- 操作相关 ------>

const loading = ref<boolean>(false)

const innerActions = computed<any[]>(() => {
  const items = (props.actions || []).map((item: any) => {
    return { ...item }
  })

  return items
})

// 提交代码
async function handleSubmit(action: any) {
  if (!formRef.value) {
    await doSubmit(action)
    return
  }

  const form = formRef.value
  // 校验表单
  if (form.validate) {
    let valid = await form.validate()
    if (!valid) return
  }

  await doSubmit(action)
}

async function handleActionBeforeTrigger(action: any) {
  const form = formRef.value

  if (action.validate === true) {
    return await form.validate()
  }
}

// action执行后触发
async function handleActionAfterTrigger(action: any) {}

/** 提交表单 */
async function doSubmit(action?: any) {
  const form = formRef.value

  const payload = tpl.deepFilter(Object.assign({}, action.extData, dataModel.value), context)

  if (props.beforeSubmit) {
    const submitFlag = await Promise.resolve().then(() => {
      return props.beforeSubmit && props.beforeSubmit(payload, action, form)
    })
    if (!submitFlag) return
  }

  if (!action?.api) return
  await apiRequest({ action: action.api, data: payload })

  if (props.afterSubmit) {
    return await Promise.resolve().then(() => {
      return props.afterSubmit && props.afterSubmit(payload, action)
    })
  }

  Message.success(action?.successMessage || '执行成功！')
}

// ----- 导出方法 ----->

defineExpose({
  setData,
  innerForm: formRef.value,
  resetFields,
  validate,
  doSubmit
})
</script>

<style lang="scss" scoped>
.form-footer {
  text-align: center;
}
</style>

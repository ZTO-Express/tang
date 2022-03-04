<template>
  <van-form ref="formRef" v-bind="$attrs">
    <slot />
    <slot name="footer">
      <div v-if="innerActions.length" class="form-footer">
        <template v-for="it in innerActions" :key="it.name">
          <van-button
            v-if="it.name === 'submit' || it.actionType === 'submit'"
            :loading="loading"
            type="primary"
            :block="true"
            @click="handleSubmit(it)"
          >
            {{ it.label || '提交' }}
          </van-button>
          <c-action
            v-else
            v-bind="it"
            :before-trigger="handleActionBeforeTrigger(it)"
            :after-trigger="handleActionAfterTrigger(it)"
            :context-data="dataModel"
          />
        </template>
      </div>
    </slot>
  </van-form>
</template>

<script setup lang="ts">
import { vue, tpl, useConfig, useAppContext, useApiRequest, warn } from '@zto/zpage'
import { useMessage } from '../../composables'

const { computed, ref } = vue

const formConfig = useConfig('components.form', {})

const props = defineProps<{
  labelWidth?: number | string
  actions?: any[]
  model?: Record<string, any>
  beforeSubmit?: Function
  onSubmit?: Function
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

function validate(...args: any[]) {
  return formRef.value.validate(...args)
}

function resetValidation() {
  return formRef.value.resetValidation()
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

  const valid = await doValidate()
  if (!valid) return

  await doSubmit(action)
}

async function handleActionBeforeTrigger(action: any) {
  if (action.validate === true) {
    return await doValidate()
  }
}

// 校验表单
async function doValidate() {
  try {
    const form = formRef.value

    if (form?.validate) await form.validate()
    return true
  } catch (ex) {
    warn('验证错误', ex)
    return false
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

  if (action?.api || props.onSubmit) {
    if (action?.api) {
      await apiRequest({ action: action.api, data: payload })
    }

    if (props.onSubmit) {
      return await Promise.resolve().then(() => {
        return props.onSubmit && props.onSubmit(payload, action)
      })
    }

    Message.success(action?.successMessage || '执行成功！')
  }

  if (props.afterSubmit) {
    return await Promise.resolve().then(() => {
      return props.afterSubmit && props.afterSubmit(payload, action)
    })
  }
}

// ----- 导出方法 ----->

defineExpose({
  innerForm: formRef.value,
  setData,
  resetValidation,
  validate,
  doSubmit
})
</script>

<style lang="scss" scoped>
.form-footer {
  margin-top: 1rem;
  box-sizing: border-box;
}
</style>

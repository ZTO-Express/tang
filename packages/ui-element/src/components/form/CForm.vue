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
import { C_FORM_KEY } from '../../consts'

import type { PromiseFunction, GenericFunction } from '@zto/zpage'

const { computed, ref, provide, reactive } = vue

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

interface ValidatorItem {
  validate?: PromiseFunction<boolean> | GenericFunction<boolean>
}

// 额外验证项
const validatorItems: ValidatorItem[] = []

// 添加额外验证项
const addValidatorItem = (target: ValidatorItem) => {
  if (target.validate) {
    validatorItems.push(target)
  }
}

// 移除额外验证项
const removeValidatorItem = (target: ValidatorItem) => {
  if (target.validate) {
    validatorItems.splice(validatorItems.indexOf(target), 1)
  }
}

const innerLabelWidth = computed(() => {
  return props.labelWidth || formConfig.labelWidth || 80
})

// 执行验证
async function validate(...args: any[]) {
  const ops = validatorItems.map(it => {
    return Promise.resolve().then(() => {
      return it.validate!(context)
    })
  })

  const flags = await Promise.all(ops)

  const valid1 = !flags.some(f => f === false)
  const valid2 = await formRef.value.validate(...args)

  return valid1 && valid2
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

// ----- provide方法 ----->
const cForm = reactive({
  addValidatorItem,
  removeValidatorItem
})

provide(C_FORM_KEY, cForm)

// ----- 导出方法 ----->

defineExpose({
  innerForm: formRef.value,
  setData,
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

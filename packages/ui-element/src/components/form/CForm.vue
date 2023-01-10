<template>
  <el-form ref="formRef" v-bind="$attrs" :model="dataModel" :label-width="innerLabelWidth">
    <slot />
    <div v-if="innerActions.length" class="form-footer">
      <template v-for="it in innerActions" :key="it.name">
        <el-button
          v-if="it.name === 'submit' || it.actionType === 'submit'"
          v-bind="it"
          v-show="it.isVisible"
          :disabled="typeof it.isDisabled !== 'undefined' ? it.isDisabled : it.disabled"
          :loading="loading"
          type="primary"
          v-preventReclick
          @click="handleSubmit(it)"
        >
          {{ it.label || '确定' }}
        </el-button>
        <el-button
          v-else-if="it.name === 'cancel' || it.actionType === 'cancel'"
          v-bind="it"
          v-show="it.isVisible"
          :disabled="typeof it.isDisabled !== 'undefined' ? it.isDisabled : it.disabled"
          type="plain"
          v-preventReclick
          @click="handleCancel(it)"
        >
          {{ it.label || '取消' }}
        </el-button>
        <c-action
          v-else
          v-bind="it"
          :before-trigger="handleActionBeforeTrigger"
          :after-trigger="handleActionAfterTrigger"
          :context-data="dataModel"
        />
      </template>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { _, computed, ref, provide, reactive, useCurrentAppInstance } from '@zto/zpage'
import { C_FORM_KEY } from '../../consts'

import type { PromiseFunction, GenericFunction } from '@zto/zpage'
import { appUtil } from '../../utils'
import { calcFormActionAttrs } from './util'

const props = defineProps<{
  labelWidth?: number | string
  actions?: any[]
  model?: Record<string, any>
  noResetProps?: string[]
  submitMethod?: Function
  beforeSubmit?: Function
  afterSubmit?: Function
  column?: any
}>()

const emit = defineEmits(['submit', 'cancel'])

const app = useCurrentAppInstance()

const formConfig = app.useComponentsConfig('form', {})

const { Message, MessageBox } = app.useMessage()
const apiRequest = app.request

const formRef = ref<any>()

// ----- 数据相关 ----->

const dataModel = ref<any>(props.model || {})

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
  const context = app.useContext(dataModel)

  const ops = validatorItems.map(it => {
    return Promise.resolve().then(() => {
      return it.validate!(context)
    })
  })

  const flags = await Promise.all(ops)

  const valid1 = !flags.some(f => f === false)

  let valid2 = true
  try {
    await formRef.value.validate(...args)
  } catch (err) {
    valid2 = false
  }

  return valid1 && valid2
}

/** 验证指定的字段 */
async function validateFields(fieldNames: string[]) {
  let valid = true
  await formRef.value?.validateField(fieldNames, (errorMessage: boolean) => {
    if (errorMessage) valid = false
  })
  return valid
}

/** 清除验证信息 */
function clearValidate() {
  return formRef.value?.clearValidate()
}

/** 重置表单，支持保留某些属性不进行重置 */
function resetFields() {
  // 保留不进行重设的值
  let reservedData: Record<string, any> | null = null

  if (props.noResetProps?.length && props.model) {
    reservedData = props.noResetProps.reduce((col: any, prop: string) => {
      col[prop] = props.model![prop]
      return col
    }, {} as any)
  }

  formRef.value?.resetFields()

  if (reservedData && props.model) {
    Object.keys(reservedData).forEach(key => {
      props.model![key] = reservedData![key]
    })
  }
}

// --------- 操作相关 ------>

const loading = ref<boolean>(false)

const innerActions = computed<any[]>(() => {
  const context = app.useContext(props.model)

  const items = (props.actions || []).map((item: any) => {
    const formActionAttrs = calcFormActionAttrs(item, context, {
      model: props.model
    })

    return { ...formActionAttrs }
  })

  return items
})

/** 取消 */
function handleCancel(action: any) {
  emit('cancel', action)
}

// 编辑状态下，是否二次确认的判断
const editorMessageBox = () => {
  return new Promise((resolve, reject) => {
    let message = props?.column?.editor?.message
    if (typeof message === 'string') {
      // message = message
    } else if (typeof message === 'function') {
      message = message(props?.model)
    } else {
      resolve(true)
      return false
    }
    if (message) {
      MessageBox.confirm(message, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          resolve(true)
        })
        .catch(() => {
          reject()
        })
    } else {
      resolve(true)
    }
  })
}

// 提交代码
async function handleSubmit(action: any) {
  if (!formRef.value) {
    editorMessageBox().then(async () => {
      await doSubmit(action)
    })
    return
  }

  const form = formRef.value

  // 校验表单
  if (form.validate) {
    let valid = await form.validate()
    if (!valid) return
  }

  editorMessageBox().then(async () => {
    await doSubmit(action)
  })
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
  let submitData = app.deepFilter({ ...action.extData, ...dataModel.value }, dataModel.value)

  const submitContext = app.useContext(submitData)

  if (props.beforeSubmit) {
    const submitFlag = await Promise.resolve().then(() => {
      return props.beforeSubmit!(submitContext, dataModel, action)
    })
    if (!submitFlag) return
  }

  if (action.payload) {
    submitData = appUtil.getActionPayload(action.payload, submitContext)
  }

  if (props.submitMethod) {
    await Promise.resolve().then(() => {
      return props.submitMethod!(submitContext, submitData, action)
    })

    emit('submit', action, submitContext)
    return
  }

  if (!action?.api) return

  if (action.apiParams) {
    const apiParams = app.deepFilter(action.apiParams, dataModel.value)
    submitData = { ...submitData, ...apiParams }
  }

  await apiRequest({ action: action.api, data: submitData })

  if (props.afterSubmit) {
    return await Promise.resolve().then(() => {
      return props.afterSubmit && props.afterSubmit(submitContext, action, submitData)
    })
  }

  emit('submit', action, submitContext)

  Message.success(action?.successMessage || '提交成功！')
}

// ----- provide方法 ----->
const cForm = reactive({
  addValidatorItem,
  removeValidatorItem,
  validateFields
})

provide(C_FORM_KEY, cForm)

// ----- 导出方法 ----->

defineExpose({
  innerForm: formRef.value,
  setData,
  resetFields,
  validate,
  validateFields,
  clearValidate,
  doSubmit
})
</script>

<style lang="scss" scoped>
.form-footer {
  text-align: center;
}

.form-footer {
  & > .c-action,
  button:not(:last-child) {
    margin-right: 12px;
  }
}
</style>

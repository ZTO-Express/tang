<template>
  <div v-if="isVisible" v-perm="$attrs.perms" class="c-action">
    <c-upload v-if="isUpload" v-bind="uploadAttrs" :disabled="isDisabled"></c-upload>
    <el-button v-else v-bind="buttonAttrs" :disabled="isDisabled" @click="handleClick">
      <slot>
        {{ buttonAttrs.label }}
      </slot>
    </el-button>
    <c-dialog v-if="form" ref="formDialogRef" v-bind="formDialogAttrs" />
    <c-dialog v-else-if="dialog" ref="dialogRef" v-bind="dialogAttrs" />
    <c-import-dialog v-else-if="isImport" ref="importRef" v-bind="importAttrs" />
  </div>
</template>

<script setup lang="ts">
import { vue, _, useAppRouter, useApiRequest, useAppContext, useApi, emitter, tpl } from '@zto/zpage'
import { useMessage } from '../../composables'

import type { GenericFunction, ApiRequestAction } from '@zto/zpage'

const { computed, ref, useAttrs } = vue

const router = useAppRouter()

const props = withDefaults(
  defineProps<{
    actionType?: string // 行为类型 （fetch, ajax）
    name?: string // 活动名称
    buttonType?: string // 按钮类型
    trigger?: GenericFunction // 触发器，覆盖action自身触发
    beforeTrigger?: GenericFunction
    afterTrigger?: GenericFunction
    api?: ApiRequestAction // api 触发
    apiParams?: Record<string, any> | GenericFunction // API参数
    payload?: any // 相关附加参数
    extData?: Record<string, any> // API参数
    contextData?: any // 数据上下文
    successMessage?: string // 成功消息
    dialog?: any // dialog action
    form?: Record<string, any> // form action
    import?: Record<string, any> // import action
    upload?: Record<string, any> // upload action
    link?: any // link action
    event?: any // event action
    message?: any // message action
    innerAttrs?: Record<string, any> // 内部属性 action
    visible?: boolean
    visibleOn?: string | GenericFunction
    disabled?: boolean
    disabledOn?: string | GenericFunction
  }>(),
  {
    buttonType: 'primary',
    visible: true,
    disabled: false
  }
)

const attrs = useAttrs()
const { MessageBox, Message } = useMessage()
const apiRequest = useApiRequest()
const fsApi = useApi('fs')

const formDialogRef = ref<any>()
const dialogRef = ref<any>()
const importRef = ref<any>()

const payloadData = computed(() => {
  if (_.isFunction(props.payload)) {
    const context = useAppContext(props.contextData)
    return props.payload(context)
  } else if (Array.isArray(props.payload)) {
    const ctxData = props.contextData || {}
    return props.payload.reduce((obj: any, key: string) => {
      if (key) obj[key] = ctxData[key]
      return obj
    }, {})
  } else {
    return props.payload
  }
})

const actionContext = computed(() => {
  const context = useAppContext(props.contextData || payloadData.value)
  return context
})

const buttonAttrs = computed(() => {
  const actionName = props.name
  const type = props.buttonType

  const label = tpl.filter(attrs.label || actionName, actionContext.value)

  const btnAttrs = { type, ...props.innerAttrs?.button, label }
  return { ...btnAttrs }
})

const isVisible = computed(() => {
  if (!props.visibleOn) return props.visible !== false

  if (_.isString(props.visibleOn)) return tpl.evalExpression(props.visibleOn, actionContext.value)
  if (_.isFunction(props.visibleOn)) return props.visibleOn(actionContext.value)

  return props.visible !== false
})

const isDisabled = computed(() => {
  if (!props.disabledOn) return props.disabled === true

  if (_.isString(props.disabledOn)) return tpl.evalExpression(props.disabledOn, actionContext.value)
  if (_.isFunction(props.disabledOn)) return props.disabledOn(actionContext.value)

  return props.disabled === true
})

const formDialogAttrs = computed(() => {
  const form = props.form
  return {
    form,
    onSubmit: dialogSubmitMethod,
    ...props.innerAttrs?.dialog
  }
})

const dialogAttrs = computed(() => {
  return {
    onSubmit: dialogSubmitMethod,
    ...props.dialog
  }
})

const isImport = computed(() => {
  return !!props.import || props.actionType === 'import'
})

const isUpload = computed(() => {
  return !!props.upload || props.actionType === 'upload'
})

const importAttrs = computed(() => {
  return {
    api: props.api,
    apiParams: props.apiParams,
    dialog: props.dialog,
    successMessage: props.successMessage,
    onSubmit: dialogSubmitMethod,
    ...attrs,
    ...(props.import as any)
  }
})

const uploadAttrs = computed(() => {
  return {
    ...attrs,
    ...(props.upload as any)
  }
})

/** 点击 */
function handleClick() {
  trigger()
}

/** 提交表单 */
async function dialogSubmitMethod(payload: any) {
  if (props.api) {
    await doApiRequest(payload)
  }

  await doAfterTrigger()
}

/** 触发活动 */
async function trigger() {
  const flag = await doBeforeTrigger()
  if (flag === false) return

  if (props.trigger) return props.trigger(attrs)

  const actionType = props.actionType

  if (actionType === 'form' || props.form) {
    // 执行表单活动
    formDialogRef.value.show(payloadData.value)
  } else if (isImport.value) {
    // 打开导入弹框
    importRef.value.show()
  } else if (actionType === 'dialog' || props.dialog) {
    // 执行弹框活动
    dialogRef.value.show(payloadData.value)
  } else if (actionType === 'download') {
    // 执行下载
    await fsApi.downloadFile(props.link, attrs)
    await doAfterTrigger()
  } else if (actionType === 'link' || props.link) {
    // 执行弹框活动
    await router.goto(props.link)
    await doAfterTrigger()
  } else if (actionType === 'event' || props.event) {
    // 发送事件
    emitter.emits(props.event as any, payloadData.value)
    await doAfterTrigger()
  } else if (props.message) {
    // 默认执行消息活动
    const messageProp = props.message

    let msgConfig: any = _.isString(messageProp)
      ? {
          boxType: 'confirm',
          type: 'warning',
          showCancelButton: true,
          message: messageProp
        }
      : {
          ...messageProp,
          boxType: 'confirm' || messageProp.boxType,
          type: messageProp.type || 'warning',
          message: messageProp.message
        }

    msgConfig = {
      title: '提示',
      cancelButtonText: '取消',
      confirmButtonText: '确定',
      ...msgConfig
    }

    return MessageBox(msgConfig).then(async () => {
      if (props.api) {
        await doApiRequest(payloadData.value)
      }

      await doAfterTrigger()
    })
  } else if (props.api) {
    await doApiRequest(payloadData.value)
    await doAfterTrigger()
  }
}

function doBeforeTrigger() {
  return Promise.resolve().then(() => {
    if (props.beforeTrigger) {
      return props.beforeTrigger()
    }
  })
}

function doAfterTrigger() {
  return Promise.resolve().then(() => {
    if (props.afterTrigger) {
      return props.afterTrigger(attrs)
    }
  })
}

async function doApiRequest(payload: any) {
  let params: any = undefined

  const context = useAppContext(props.contextData)

  if (payload) params = tpl.deepFilter(payload, context)

  if (props.apiParams) {
    const apiParams = tpl.deepFilter(props.apiParams, context)
    params = { ...params, ...apiParams }
  }

  if (props.extData) {
    params = { ...params, ...props.extData }
  }

  await apiRequest({
    action: props.api as string,
    params
  })

  Message.success(props.successMessage || '执行成功！')
}

defineExpose({
  trigger
})
</script>

<style lang="scss" scoped>
.c-action {
  display: inline-block;
}
</style>

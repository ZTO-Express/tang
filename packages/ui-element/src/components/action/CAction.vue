<template>
  <div v-if="isVisible" class="c-action">
    <el-button v-bind="buttonAttrs" :disabled="isDisabled" @click="handleClick">
      {{ buttonAttrs.label }}
    </el-button>
    <c-dialog
      v-if="form"
      ref="formDialogRef"
      v-bind="formDialogAttrs"
      :on-submit="handleFormDialogSubmit"
    />
    <c-dialog v-else-if="dialog" ref="dialogRef" v-bind="dialogAttrs" />
    <c-import-dialog v-else-if="isImport" ref="importRef" v-bind="importAttrs" />
  </div>
</template>

<script setup lang="ts">
import { vue, _, useAppRouter, useApiRequest, useAppContext, emitter, tpl } from '@zto/zpage'
import { useMessage } from '../../composables'

import type { GenericFunction, ApiRequestAction } from '@zto/zpage'

const { computed, ref, useAttrs } = vue

const router = useAppRouter()

const props = withDefaults(
  defineProps<{
    actionType?: string // 行为类型 （fetch, ajax）
    name: string // 活动名称
    buttonType?: string // 按钮类型
    trigger?: GenericFunction // 触发器，覆盖action自身触发
    beforeTrigger?: GenericFunction
    afterTrigger?: GenericFunction
    api?: ApiRequestAction // api 触发
    payload?: Record<string, any> // 相关附加参数
    contextData?: any // 数据上下文
    successMessage?: string // 成功消息
    dialog?: Record<string, any> // dialog action
    form?: Record<string, any> // form action
    import?: Record<string, any> // import action
    link?: any // link action
    event?: any // event action
    message?: any // message action
    innerAttrs?: Record<string, any> // 内部属性 action
    visible?: boolean
    visibleOn?: string
    disabled?: boolean
    disabledOn?: string
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

const formDialogRef = ref<any>()
const dialogRef = ref<any>()
const importRef = ref<any>()

const formModel = ref(props.form?.model || props.payload || {})

const context = useAppContext(formModel)

const buttonAttrs = computed(() => {
  const actionName = props.name
  const type = props.buttonType

  const label = tpl.filter(attrs.label || actionName, context)

  const btnAttrs = { type, ...props.innerAttrs?.button, label }

  return { ...btnAttrs }
})

const isVisible = computed(() => {
  if (!props.visibleOn) return props.visible !== false

  const context = useAppContext(props.contextData || formModel)
  return tpl.evalExpression(props.visibleOn, context)
})

const isDisabled = computed(() => {
  if (!props.disabledOn) return props.disabled === true

  const context = useAppContext(props.contextData || formModel)
  return tpl.evalExpression(props.disabledOn, context)
})

const formDialogAttrs = computed(() => {
  const form = props.form
  return {
    form,
    ...props.innerAttrs?.dialog
  }
})

const dialogAttrs = computed(() => {
  return props.dialog
})

const isImport = computed(() => {
  return !!props.import || props.actionType === 'import'
})

const importAttrs = computed(() => {
  return {
    api: props.api,
    dialog: props.dialog,
    successMessage: props.successMessage,
    ..._.omit(attrs, ['import']),
    ...(attrs.import as any)
  }
})

/** 点击 */
function handleClick() {
  trigger()
}

/** 执行提交 */
async function handleFormDialogSubmit(model: any, options: any, form: any, dialog: any) {
  await doSubmitForm(model)
}

/** 提交表单 */
async function doSubmitForm(model: any) {
  if (!props.api) return

  await apiRequest({ action: props.api, data: model })
}

/** 触发活动 */
async function trigger() {
  const flag = await doBeforeTrigger()
  if (flag === false) return

  if (props.trigger) return props.trigger(attrs)

  const actionType = props.actionType

  if (actionType === 'form' || props.form) {
    // 执行表单活动
    formDialogRef.value.show(formModel)
  } else if (isImport.value) {
    // 执行弹框活动
    importRef.value.show()
  } else if (actionType === 'dialog' || props.dialog) {
    // 执行弹框活动
    dialogRef.value.show()
  } else if (actionType === 'link' || props.link) {
    // 执行弹框活动
    await router.goto(props.link)
  } else if (actionType === 'event' || props.event) {
    // 发送事件
    emitter.emits(props.event as any, props.payload)
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

    msgConfig.title = msgConfig.title || '提示'

    msgConfig = Object.assign(
      {
        cancelButtonText: '取消',
        confirmButtonText: '确定'
      },
      msgConfig
    )

    if (props.api) {
      return MessageBox(msgConfig).then(async () => {
        await doApiRequest(props.payload)
      })
    }
  } else if (props.api) {
    await doApiRequest(props.payload)
  }

  await doAfterTrigger()
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

  if (payload) {
    const context = useAppContext(props.contextData)
    params = tpl.deepFilter(payload, context)
  } else {
    params = props.contextData
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

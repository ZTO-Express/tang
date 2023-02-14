<template>
  <div
    v-if="isVisible && isPermission"
    v-perm="innerPerms"
    v-preventReclick
    class="c-action"
    :class="{ ellipsis: textEllipsis }"
  >
    <c-upload v-if="isUpload" v-bind="uploadAttrs" :disabled="isDisabled"></c-upload>
    <cmpt
      v-else-if="cmpt"
      v-bind="{ ...$props, ...$attrs }"
      :disabled="isDisabled"
      :config="cmpt"
      :context-data="contextData"
    ></cmpt>
    <el-button v-else v-bind="buttonAttrs" class="c-action-button" :disabled="isDisabled" @click="handleClick">
      <slot>
        {{ buttonAttrs.label }}
      </slot>
    </el-button>
    <c-dialog v-if="form" ref="formDialogRef" v-bind="formDialogAttrs" />
    <c-dialog v-else-if="dialog" ref="dialogRef" v-bind="innerDialogAttrs" />
    <c-import-dialog v-else-if="isImport" ref="importRef" v-bind="importAttrs" />
  </div>
</template>

<script setup lang="ts">
import { _, useCurrentAppInstance, tpl, computed, ref, useAttrs, usePreventReclick } from '@zto/zpage'
import { appUtil } from '../../utils'

import type { GenericFunction, ApiRequestAction } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    actionType?: string // 行为类型 （fetch, ajax）
    name?: string // 活动名称
    buttonType?: string // 按钮类型
    textEllipsis?: boolean // true = 单元格内的按钮文案如果超出宽度则省略号 / false = 默认
    trigger?: GenericFunction // 触发器，覆盖action自身触发
    beforeTrigger?: GenericFunction
    afterTrigger?: GenericFunction
    api?: ApiRequestAction | string // api 触发
    apiParams?: Record<string, any> | GenericFunction // API参数
    payload?: any // 相关附加参数
    extData?: Record<string, any> // API参数
    contextData?: any // 数据上下文
    successMessage?: string | boolean // 成功消息
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
    cmpt?: Record<string, any>
  }>(),
  {
    visible: true,
    disabled: false
  }
)

const attrs = useAttrs()

const app = useCurrentAppInstance()

const router = app.router
const emitter = app.emitter
const { MessageBox, Message } = app.useMessage()
const fsApi = app.apis.fsApi

const formDialogRef = ref<any>()
const dialogRef = ref<any>()
const importRef = ref<any>()

/** 这里的disable主要用来从内部控制控件只读状态（不受外界状态影响） */
const { reclickDisabled } = usePreventReclick()

const innerPerms = computed(() => {
  if (attrs.perm == false) return null

  if (attrs.perms) return attrs.perms
  if (!attrs.perm) return null

  if (_.isString(attrs.perm)) return [attrs.perm]
  if (attrs.perm === true && props.api) return [props.api?.url || props.api]
  if (attrs.perm === true && props.actionType === 'export') return [attrs.exportType] // 如果是导出，且perm=true，则根据exportType来判断权限

  return appUtil.getCmptPermData({ ...attrs, api: props.api })
})

const allAttrs = computed(() => {
  return { ...props, ...attrs }
})

// 根据innerPerms的数据判断当前的action是否remove（v-perm只是display: none）
const isPermission = computed(() => {
  if (innerPerms.value && Array.isArray(innerPerms.value)) {
    return innerPerms.value.some(item => app.checkPermission(item))
  }
  return true
})

// 此情况没兼容payload异步情况，故只trigger内用buildActionData代替，其他不变
const payloadData = computed(() => {
  if (!props.payload) return props.payload

  const context = app.useContext(props.contextData)
  return appUtil.getActionPayload(props.payload, context)
})

// trigger内兼容payload异步情况
function buildActionData() {
  if (!props.payload) return props.payload

  const context = app.useContext(props.contextData)
  return appUtil.getActionPayload(props.payload, context)
}

const actionContextData = computed(() => {
  return props.contextData || payloadData.value
})

const actionContext = computed(() => {
  return app.useContext(actionContextData.value)
})

const actionLabel = computed(() => {
  const label = tpl.filter(attrs.label || props.name, actionContextData.value)
  return label
})

const buttonAttrs = computed(() => {
  let buttonType = props.buttonType
  if (!buttonType) {
    buttonType = props.actionType === 'link' ? 'text' : 'primary'
  }

  const btnAttrs = { type: buttonType, ...props.innerAttrs?.button, label: actionLabel.value }
  return btnAttrs
})

const isVisible = computed(() => {
  const result = app.calcOnExpression(props.visibleOn, actionContextData.value, props.visible !== false)
  return result
})

// 是否只读
const isDisabled = computed(() => {
  // 防重复点击功能
  if (reclickDisabled.value === true) return true

  const result = app.calcOnExpression(props.disabledOn, actionContextData.value, props.disabled)
  return result
})

const formDialogAttrs = computed(() => {
  const form = props.form
  return {
    title: actionLabel.value,
    form,
    onSubmit: dialogSubmitMethod,
    contextData: props.contextData,
    ...props.innerAttrs?.dialog
  }
})

const innerDialogAttrs = computed(() => {
  let dialogConfig = props.dialog || {}
  if (_.isFunction(dialogConfig)) {
    dialogConfig = dialogConfig(actionContext.value)
  }

  return {
    title: actionLabel.value,
    onSubmit: dialogSubmitMethod,
    contextData: props.contextData,
    bodyHeight: attrs.height,
    ...dialogConfig,
    ...props.innerAttrs?.dialog
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
    title: actionLabel.value,
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
  const { type: buttonType, label: buttonLabel } = buttonAttrs.value
  app.emits('trace', {
    event_code: 'action',
    event_data: {
      buttonType,
      buttonLabel
    }
  })
  trigger()
}

/** 提交表单 */
async function dialogSubmitMethod(payload: any) {
  if (props.api) await doApiRequest(payload)

  await doAfterTrigger()
}

/** 触发活动 */
async function trigger() {
  const flag = await doBeforeTrigger()
  if (flag === false) return

  if (props.trigger) return props.trigger(allAttrs.value, actionContext.value)

  const actionType = props.actionType

  let afterTriggerPayload: any = null

  // 故只trigger内用buildActionData代替，其他不变
  const actionData = await buildActionData()

  if (actionType === 'form' || props.form) {
    // 执行表单活动
    formDialogRef.value.show(actionData)
  } else if (isImport.value) {
    // 打开导入弹框
    importRef.value.show()
  } else if (actionType === 'dialog' || props.dialog) {
    // 执行弹框活动
    dialogRef.value.show(actionData)
  } else if (actionType === 'download') {
    // 执行下载
    await fsApi.downloadFile!(props.link, attrs)
    await doAfterTrigger()
  } else if (actionType === 'link' || props.link) {
    // 执行弹框活动
    const link = tpl.deepFilter(props.link, actionContext.value)
    await router.goto(link)
    await doAfterTrigger()
  } else if (actionType === 'event' || props.event) {
    // 发送事件
    app.emits(props.event as any, actionData)
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
        afterTriggerPayload = await doApiRequest(actionData)
      }
      await doAfterTrigger(afterTriggerPayload)
    })
  } else if (props.api) {
    afterTriggerPayload = await doApiRequest(actionData)
    await doAfterTrigger(afterTriggerPayload)
  }
}

function doBeforeTrigger() {
  return Promise.resolve().then(() => {
    if (props.beforeTrigger) {
      return props.beforeTrigger(actionContext.value)
    }
  })
}

function doAfterTrigger(payload?: any) {
  return Promise.resolve().then(() => {
    if (props.afterTrigger) {
      return props.afterTrigger(actionContext.value, payload, attrs)
    }
  })
}

async function doApiRequest(payload: any) {
  if (!props.api) return Promise.resolve()

  let params: any = undefined

  if (payload) params = tpl.deepFilter(payload, actionContext.value)

  if (props.apiParams) {
    const apiParams = tpl.deepFilter(props.apiParams, actionContext.value)
    params = { ...params, ...apiParams }
  }

  if (props.extData) {
    params = { ...params, ...props.extData }
  }

  const res = await app.request({ action: props.api, params })

  if (props.successMessage !== false) {
    Message.success(props.successMessage || '执行成功！')
  }

  return res
}

defineExpose({ trigger, reclickDisabled })
</script>

<style lang="scss" scoped>
.c-action {
  display: inline-block;

  &.ellipsis {
    width: 100%;

    .c-action-button {
      width: 100%;
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>

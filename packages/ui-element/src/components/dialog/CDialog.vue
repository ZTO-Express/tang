<template>
  <el-dialog
    v-if="isShowDialog"
    v-bind="dialogAttrs"
    :custom-class="`c-dialog ${noPadding ? 'no-padding' : ''}`"
    :model-value="dialogVisible"
    :close-on-click-modal="false"
    :append-to-body="appendToBody"
    :fullscreen="innerFullscreen"
    @close="close"
  >
    <template #title>
      <div class="dialog-title">
        <slot name="title">{{ title }}</slot>
        <div class="dialog-title-actions">
          <el-button
            v-if="fullscreenable"
            class="action-button"
            type="button"
            :icon="`el-icon-${innerFullscreen ? 'crop' : 'full-screen'}`"
            @click="handleToggleFullscreen"
          ></el-button>
        </div>
      </div>
    </template>
    <el-row :gutter="24" :style="`margin: 0 0 0; height: ${bodyHeight};`">
      <el-col
        ref="contentWrapperRef"
        :class="`dialog-body-con fh ${size} ${overflowX ? 'overflow-x' : ''}`"
        :span="24"
        :style="innerBodyStyle"
      >
        <slot />
        <widget v-if="body" :schema="body" :context-data="dataModel" />
        <cmpt v-else-if="cmpt" ref="cmptRef" :config="cmpt" :context-data="dataModel" :on-submit="onCmptSubmit" />
        <c-form
          v-else-if="dialogFormItems.length"
          ref="formRef"
          v-bind="dialogFormAttrs"
          v-loading="loading"
          :model="dataModel"
        >
          <c-form-items v-bind="dialogFormItemsAttrs" :model="dataModel" :items="dialogFormItems"></c-form-items>
        </c-form>
      </el-col>
    </el-row>
    <template #[footer]>
      <div class="dialog-footer">
        <slot name="footer">
          <template v-for="it in actionItems" :key="it.name">
            <el-button v-if="it.name === 'close'" v-preventReclick v-bind="it" class="q-mr-md" @click="close(it)">
              {{ it.label || '取消' }}
            </el-button>
            <el-button
              v-else-if="it.name === 'submit' || it.actionType === 'submit'"
              v-preventReclick
              v-bind="it"
              class="q-mr-md"
              :loading="loading"
              type="primary"
              @click="submit(it)"
            >
              {{ it.label || '确定' }}
            </el-button>
            <c-action
              v-else
              v-bind="it"
              class="q-mr-md"
              :after-trigger="handleActionAfterTrigger"
              :context-data="dataModel"
            />
          </template>
        </slot>
      </div>
    </template>
    <CDialog v-for="(d, key) in innerDialogs" :key="key" v-bind="d" :ref="el => setItemRef(el, key)" />
  </el-dialog>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { _, computed, ref, useAttrs, noop, onBeforeRouteUpdate, useCurrentAppInstance, reactive } from '@zto/zpage'

import type { CmptConfig, GenericFunction } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    title?: string
    loading?: boolean
    width?: string | number
    size?: string // 对话框大小 large, full
    actions?: Record<string, any>
    innerAttrs?: Record<string, any> // 内部元素属性
    labelWidth?: string | number // 表单label宽度
    itemSpan?: number // 表单span

    formAttrs?: Record<string, any> // 表单属性
    formItemsAttrs?: Record<string, any> // 表单项属性
    formItemSpan?: number // 表单span(遗弃)
    formItems?: Record<string, any> // 表单项

    appendToBody?: boolean
    noSubmit?: boolean // 没有提交按钮（只有关闭）
    noPadding?: boolean
    noFooter?: boolean
    body?: any
    bodyStyle?: string
    bodyHeight?: string
    cmpt?: CmptConfig // 自定义组件类型
    overflowX?: boolean // 是否显示横向滚动条
    beforeSubmit?: GenericFunction
    onSubmit?: GenericFunction
    onShow?: GenericFunction

    fullscreen?: boolean
    fullscreenable?: boolean

    innerDialogs?: Record<string, any> // 内部弹框
  }>(),
  {
    fullscreenable: false,
    appendToBody: true,
    noSubmit: false,
    noPadding: false,
    noFooter: false,
    bodyHeight: 'auto',
    overflowX: false
  }
)

// 通过动态插槽，控制footer的显示隐藏
const footer = ref()
if (props.noFooter) {
  footer.value = ''
} else {
  footer.value = 'footer'
}

const emit = defineEmits(['close', 'submitted'])

const attrs = useAttrs()

// 获取当前组件实例
const app = useCurrentAppInstance()

const { Message } = app.useMessage()
const apiRequest = app.request

const contentWrapperRef = ref()
const isShowDialog = ref(false)

const formRef = ref<any>()

let __callbacks__: GenericFunction[] = []

const cmptRef = ref<any>()

const dataModel = ref<any>({})

const dialogVisible = ref(true)

const innerBodyStyle = computed(() => {
  if (!props.bodyStyle) {
    return props.noPadding ? { padding: 0 } : {}
  }
  return props.bodyStyle
})

const dialogFormItems = computed<any>(() => {
  if (typeof props.formItems === 'function') {
    const context = app.useContext(dataModel.value)
    return props.formItems(context)
  }
  return props.formItems || []
})

const actionItems = computed<any[]>(() => {
  const actions = props.actions || {}
  const items = Object.keys(actions).map(key => {
    const item = actions[key]
    return {
      name: item.name || key,
      ...item
    }
  })

  if (!items.length) {
    if (props.noSubmit) return [{ name: 'close', label: '关闭' }]
    return [{ name: 'close' }, { name: 'submit' }]
  }

  return items
})

const dialogAttrs = computed(() => {
  let _attrs = { ...props.innerAttrs?.dialog, ...attrs }

  let sizeAttrs: any = {}

  if (props.size === 'large') {
    sizeAttrs = { top: '20px', width: '1000px' }
  } else if (props.size === 'full') {
    sizeAttrs = { top: '5px', width: '99vw' }
  }

  if (props.width) {
    sizeAttrs.width = props.width
  }

  return { ...sizeAttrs, ..._attrs }
})

const dialogFormAttrs = computed(() => {
  const formAttrs = {
    labelWidth: props.labelWidth,
    ...props.formAttrs,
    ...props.innerAttrs?.form
  }
  return formAttrs
})

const dialogFormItemsAttrs = computed(() => {
  const formItemsAttrs = {
    showOperation: false,
    span: props.formItemSpan || props.itemSpan,
    ...props.formItemsAttrs,
    ...props.innerAttrs?.formItems
  }
  return formItemsAttrs
})

// 路由变化时关闭dialog
onBeforeRouteUpdate(() => {
  close()
})

/** 组件提交 */
async function onCmptSubmit(options?: any) {
  const submitResult = await doSubmit(options)
  if (submitResult === false) return

  if (options?.closeAfterSuccess !== false) close({ ...options, triggerSuccess: true }, submitResult)
}

function handleActionAfterTrigger(ctx: any, payload: any, options?: any) {
  if (options?.closeAfterSuccess !== false) {
    close({ ...options, triggerSuccess: true })
  }
}

const isFullscreen = ref(props.fullscreen)

const innerFullscreen = computed(() => {
  if (props.fullscreenable) return isFullscreen.value
  return props.fullscreen
})

function handleToggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

// 提交
async function submit(options?: any) {
  if (!formRef.value) {
    await doSubmit(options)
    return
  }

  const form = formRef.value

  // 校验表单
  if (form.validate) {
    const valid = await form.validate()
    if (!valid) return
  }

  let submitFlag = true

  // 提交前逻辑
  if (dialogFormAttrs.value.beforeSubmit) {
    let flag = dialogFormAttrs.value.beforeSubmit(dataModel, {
      form,
      attrs: dialogFormAttrs.value
    })
    if (flag instanceof Promise) {
      flag = await flag
    }
    if (typeof flag === 'undefined') {
      submitFlag = true
    } else if (typeof flag === 'boolean') {
      submitFlag = flag
    }
  }

  //关闭后调用回调
  if (submitFlag) {
    // 根据submit的返回值进行判断，默认返回的是undefined，如果定义了doAction，则需要明确返回false来控制close的是否触发
    const submitResult = await doSubmit(options)
    if (submitResult === false) return

    emit('submitted', dataModel.value, attrs, form, app)

    while (__callbacks__?.length) {
      const callbackFn = __callbacks__.shift()
      try {
        await (callbackFn || noop).call(null, submitResult, dataModel.value)
      } catch (err: any) {
        __callbacks__.push(callbackFn || noop)
        throw new Error(err)
      }
    }

    if (options?.closeAfterSuccess !== false) close({ ...options, triggerSuccess: true })
  }
}

/**
 * 展示
 */
async function show(payload: any, callback?: GenericFunction) {
  dataModel.value = _.deepClone(payload || {})

  if (callback) {
    ;(__callbacks__ || (__callbacks__ = [])).push(callback)
  }

  if (props.onShow) {
    const context = app.useContext(dataModel.value)
    const result = await Promise.resolve().then(() => props.onShow!(context))
    if (result === false) return

    if (Object.keys(result || {}).includes('payload')) {
      dataModel.value = result.payload
    }
  }

  isShowDialog.value = true
}

/**
 * 关闭
 */
function close(options?: any, submitResult?: any) {
  // 关闭状态不处理
  if (!isShowDialog.value) return

  isShowDialog.value = false

  // callback清除
  __callbacks__ && (__callbacks__.length = 0)

  emit('close', { options, model: dataModel.value, result: submitResult })
}

/** 提交表单 */
async function doSubmit(options?: any) {
  const extData = options?.extData && app.deepFilter(options?.extData, dataModel.value)

  let payload = { ...extData, ...dataModel.value }

  const beforeSubmit = options?.beforeSubmit || props.beforeSubmit

  if (beforeSubmit) {
    const context = app.useContext(payload)
    let result = await Promise.resolve().then(() => beforeSubmit!(context, dataModel, options, { ...componentExposed }))
    if (result === false) return false
    if (result && _.isObject(result)) payload = result
  }

  // 执行自定义组件提交
  if (cmptRef.value) {
    const innerCmpt = cmptRef.value?.innerCmpt

    if (innerCmpt?.submit) {
      const flag = await Promise.resolve().then(() => {
        return innerCmpt.submit(payload, options)
      })
      if (flag === false) return false
    }
  }

  const onSubmit = options?.onSubmit || props.onSubmit
  if (onSubmit) {
    return await Promise.resolve().then(() => {
      return onSubmit!(payload, options) // 如果父组件有传过来onSubmit，则返回执行结果，默认返回的是undefined，如果定义了doAction，则需要明确返回false来控制close的是否触发
    })
  }

  if (!options?.api) return

  const requestResult = await apiRequest({ action: options.api, data: payload })

  Message.success(options?.successMessage || '执行成功！')

  return requestResult
}

// ----------- 二次弹窗 ----------->

const innerDialogs = computed(() => {
  if (!props.innerDialogs || !_.isObject(props.innerDialogs)) return {}

  const _dialog: Record<string, any> = {}

  const context = app.useContext(dataModel.value)

  Object.entries(props.innerDialogs).forEach(([k, d]) => {
    let _attrs = d
    if (typeof d === 'function') _attrs = d(context, d)

    _dialog[k] = { ..._attrs }
  })

  return { ..._dialog }
})

const innerDialogRefs: Record<string, any> = reactive({})

/** 显示内部弹窗 */
function showInnerDialog(name: string, payload: any) {
  const _innerDialogRef = innerDialogRefs[name]
  return new Promise((resolve, reject) => {
    if (!_innerDialogRef) reject('获取内部弹框错误')

    _innerDialogRef.show(payload, (submitResult: any, innerModel: any) => {
      resolve({
        dataModel: dataModel.value,
        innerModel,
        submitResult
      })
    })
  })
}

const setItemRef = (el: any, key: any) => {
  if (!el || !key) return
  innerDialogRefs[key] = el
}

/** 内部导出 */
const componentExposed = Object.freeze({ show, close, dataModel, showInnerDialog })

defineExpose({ ...componentExposed })
</script>

<style lang="scss">
.c-dialog {
  .dialog-title {
    position: relative;
    font-size: 14px;
    font-weight: bold;
    display: flex;
  }

  .dialog-title-actions {
    position: absolute;
    right: 0;
    top: -5px;

    & > .action-button {
      border: 0;
      outline: 0;
      cursor: pointer;
      background: 0 0;
      font-weight: bold;
      margin-right: 10px;
      font-weight: bold;
    }
  }

  .dialog-body-con {
    overflow-x: hidden;
    padding: 12px;

    max-height: calc(95vh - 110px); // 防止出现外部滚动条

    &.large {
      max-height: calc(95vh - 140px); // 防止出现外部滚动条
    }

    &.full {
      max-height: calc(95vh - 140px); // 防止出现外部滚动条
    }

    &.overflow-x {
      overflow-x: auto;
    }
  }

  &.no-padding {
    .el-dialog__body {
      padding: 0;
    }

    .dialog-body-con {
      padding: 0;
    }
  }
}

.el-select-dropdown__item {
  height: auto;
}

.el-dialog__body {
  overflow-y: auto;
}
</style>

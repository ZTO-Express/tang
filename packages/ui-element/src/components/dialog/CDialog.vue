<template>
  <el-dialog
    v-if="isShowDialog"
    v-bind="dialogAttrs"
    :custom-class="`c-dialog ${noPadding ? 'no-padding' : ''}`"
    :model-value="dialogVisible"
    :close-on-click-modal="false"
    :append-to-body="appendToBody"
    @close="close"
  >
    <template #title>
      <div class="dialog-title">
        <slot name="title">{{ title }}</slot>
      </div>
    </template>
    <el-row :gutter="24" :style="`margin: 0 0 0; height: ${bodyHeight};`">
      <el-col
        ref="contentWrapperRef"
        :class="`dialog-body-con ${size}`"
        :span="24"
        :style="`overflow-y: auto; padding: 12px; ${bodyStyle}`"
      >
        <slot />
        <c-form
          v-if="dialogFormItems.length"
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
            <el-button v-if="it.name === 'close'" v-bind="it" class="q-mr-md" @click="close(it)">
              {{ it.label || '取消' }}
            </el-button>
            <el-button
              v-else-if="it.name === 'submit' || it.actionType === 'submit'"
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
  </el-dialog>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue, vueRouter, tpl, noop, _, useApiRequest, useAppContext } from '@zto/zpage'
import { useMessage } from '../../composables'

import type { GenericFunction } from '@zto/zpage'

const { computed, getCurrentInstance, ref, useAttrs, watch } = vue
const { onBeforeRouteUpdate } = vueRouter

const props = withDefaults(
  defineProps<{
    title?: string
    loading?: boolean
    size?: string // 对话框大小 large, full
    actions?: Record<string, any>
    innerAttrs?: Record<string, any> // 内部元素属性
    labelWidth?: string | number // 表单label宽度
    formItemSpan?: number // 表单span
    formItems?: Record<string, any> // 表单项
    appendToBody?: boolean
    noSubmit?: boolean // 没有提交按钮（只有关闭）
    noPadding?: boolean
    noFooter?: boolean
    bodyStyle?: string
    bodyHeight?: string
    onSubmit?: GenericFunction
  }>(),
  {
    appendToBody: true,
    noSubmit: false,
    noPadding: false,
    noFooter: false,
    bodyHeight: 'auto'
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

// 获取当前组件实例
const instance = getCurrentInstance()

const contentWrapperRef = ref()
const isShowDialog = ref(false)
const formRef = ref<any>()

const attrs = useAttrs()
const { Message } = useMessage()
const apiRequest = useApiRequest()

let __callbacks__: GenericFunction[] = []

const dataModel = ref<any>({})

const dialogVisible = ref(true)

const dialogFormItems = computed<any>(() => {
  if (typeof props.formItems === 'function') return props.formItems(dataModel.value)
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
  let dialogAttrs = { ...props.innerAttrs?.dialog }

  let sizeAttrs = {}

  if (props.size === 'large') {
    sizeAttrs = { top: '20px', width: '1000px' }
  } else if (props.size === 'full') {
    sizeAttrs = { top: '5px', width: '99vw' }
  }

  return { ...sizeAttrs, ...dialogAttrs }
})

const dialogFormAttrs = computed(() => {
  const formAttrs = {
    labelWidth: props.labelWidth,
    ...props.innerAttrs?.form
  }
  return formAttrs
})

const dialogFormItemsAttrs = computed(() => {
  const formItemsAttrs = {
    showOperation: false,
    span: props.formItemSpan,
    ...props.innerAttrs?.formItems
  }
  return formItemsAttrs
})

// 路由变化时关闭dialog
onBeforeRouteUpdate(() => {
  close()
})

function handleActionAfterTrigger(options?: any) {
  if (options?.closeAfterSuccess !== false) {
    close()
  }
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
    let valid = await form.validate()
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
    await doSubmit(options)

    // 没传过callback 调用全局
    if (!__callbacks__ || !__callbacks__.length) {
      emit('submitted', dataModel.value, attrs, form, instance)
    }

    while (__callbacks__ && __callbacks__.length) {
      const callbackFn = __callbacks__.shift()
      try {
        await (callbackFn || noop).call(null, dataModel)
      } catch (err: any) {
        __callbacks__.push(callbackFn || noop)
        throw new Error(err)
      }
    }

    if (options?.closeAfterSuccess !== false) close()
  }
}

/**
 * 展示
 */
function show(payload: any, callback?: GenericFunction) {
  dataModel.value = _.deepClone(payload || {})
  if (callback) {
    ;(__callbacks__ || (__callbacks__ = [])).push(callback)
  }

  isShowDialog.value = true
}

/**
 * 关闭
 */
function close(options?: any) {
  // 关闭状态不处理
  if (!isShowDialog.value) return

  isShowDialog.value = false

  // callback清除
  __callbacks__ && (__callbacks__.length = 0)

  emit('close', { model: dataModel.value })
}

/** 提交表单 */
async function doSubmit(options?: any) {
  const context = useAppContext(dataModel.value)

  const extData = tpl.deepFilter(options.extData, context)
  const payload = Object.assign({}, extData, dataModel.value)

  if (props.onSubmit) {
    return await Promise.resolve().then(() => {
      return props.onSubmit!(payload, options)
    })
  }

  if (!options?.api) return

  await apiRequest({ action: options.api, data: payload })

  Message.success(options?.successMessage || '执行成功！')
}

defineExpose({
  show,
  close
})
</script>

<style lang="scss">
.c-dialog {
  .dialog-title {
    font-size: 14px;
    font-weight: bold;
  }

  .dialog-body-con {
    max-height: calc(95vh - 110px); // 防止出现外部滚动条

    &.large {
      max-height: calc(95vh - 140px); // 防止出现外部滚动条
    }

    &.full {
      max-height: calc(95vh - 140px); // 防止出现外部滚动条
    }
  }

  &.no-padding {
    .el-dialog__body {
      padding: 0;
    }
  }
}

.el-select-dropdown__item {
  height: auto;
}
</style>

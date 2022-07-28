<template>
  <template v-if="isReadonly">{{ innerText }}</template>
  <el-popover
    v-else
    v-bind="popoverAttrs"
    v-model:visible="isVisible"
    type="primary"
    trigger="manual"
    :width="config.width"
  >
    <div v-if="isVisible" class="body-content">
      <div class="title">{{ title }}</div>
      <cmpt v-if="config.cmpt" v-bind="cmptAttrs" :model="formModel" />
      <c-form v-else ref="formRef" v-bind="formAttrs" :actions="formActions" :model="formModel">
        <c-form-items ref="formItemsRef" v-bind="formItemsAttrs" :model="formModel" />
      </c-form>
    </div>
    <template #reference>
      <span class="reference-content" @click="isVisible = true">
        <span v-if="isShowIcon" class="reference-icon">
          <i v-if="config.icon" :class="config.icon" />
          <el-icon v-else><Edit /></el-icon>
        </span>
        <span class="reference-text">{{ innerText }}</span>
      </span>
    </template>
  </el-popover>

  <!-- mask -->
  <!-- 模拟类弹窗 -->
  <!-- 解决多个pop重叠问题，滚动z-index问题 -->
  <!-- 会一直触发el-table的show-overflow-tooltip，稍微影响用户体验，采用teleport解决此问题 -->
  <teleport v-if="isVisible" to="body">
    <div class="pop-editor-mask" @click="isVisible = false"></div>
  </teleport>
</template>

<script setup lang="ts">
import { _, ref, computed, watch, useCurrentAppInstance, uuid, onMounted, onUnmounted } from '@zto/zpage'

import { Edit } from '@element-plus/icons'
import { appUtil } from '../../utils'

const props = withDefaults(
  defineProps<{
    title?: string // 标题
    text?: string | number // 内容
    popover?: any // 内容
    config?: any // 当前编辑类型
    column: any // 当前列
    scope?: any // 当前scope
    model?: any
    isBatch?: boolean // 是否批量编辑
  }>(),
  {
    config: () => ({}),
    isBatch: false
  }
)

const emit = defineEmits(['submit', 'cancel'])

const app = useCurrentAppInstance()

const formModel = ref<any>(props.model)
const formRef = ref<any>()

const isVisible = ref<boolean>(false)

// 编辑权限
const innerEditPerms = computed(() => {
  const api = props.config?.api
  const editPerm = props.config?.editPerm
  const editPerms = props.config?.editPerms

  if (editPerm == false) return null
  if (editPerms) return editPerms
  if (!editPerm) return null
  if (_.isString(editPerm)) return [editPerm]
  if (editPerm === true && api) return [api]
  return null
})

// 只读
const isReadonly = computed(() => {
  return !app.checkPermission(innerEditPerms.value)
})

const innerText = computed(() => {
  return props.text || props.column.label || '编辑'
})

const popoverAttrs = computed(() => {
  const _attrs = props.popover && _.isObject(props.popover) ? props.popover : {}
  if (!_attrs.placement) _attrs.placement = 'top'
  return _attrs
})

const isShowIcon = computed(() => {
  return props.config.showIcon !== false
})

// 组件属性
const cmptAttrs = computed(() => {
  return {
    prop: props.column?.prop || 'value',
    column: props.column,
    config: props.config?.cmpt,
    onCancel: handleCancel,
    onSubmit: handleSubmit
  }
})

// 表单属性
const formAttrs = computed(() => {
  const _formAttrs = _.pick(props.config, 'submitMethod', 'beforeSubmit', 'afterSubmit')
  return {
    span: 24,
    labelWidth: 200,
    column: props.column,
    onCancel: handleCancel,
    onSubmit: handleSubmit,
    ..._formAttrs,
    ...props.config.form
  }
})

const formActions = computed(() => {
  const action = props.config?.action || props.config?.form?.action
  let actions = props.config?.actions || props.config?.form?.actions || []

  if (action) actions = [action, ...actions]

  if (!actions.length) {
    const _submitAttrs = _.pick(props.config, 'api', 'apiParams', 'extData')

    actions = [{ name: 'cancel' }, { name: 'submit', ..._submitAttrs, ...props.config?.submit }]
  }

  return actions
})

const formItemsAttrs = computed(() => {
  let items = props.config?.form?.items || []

  if (!items.length) {
    const itemType = props.config?.itemType || 'input'
    const itemProp = props.column?.prop || 'value'
    const itemLabel = props.column?.label || ''

    const formItemConfig = _.omit(props.config, ['form', 'itemType', 'action'])
    items = [{ labelWidth: 0, span: 24, type: itemType, prop: itemProp, label: itemLabel, ...formItemConfig }]
  }

  return { ...props.config?.form, span: formAttrs.value.span, items, showOperation: false }
})

const title = computed(() => {
  const prefix = props.isBatch ? '批量编辑' : '编辑'
  return props.title || props.config?.title || `${prefix}${props.column.label}`
})

watch(
  () => isVisible.value,
  () => {
    if (!isVisible.value) return

    let modelData = props.model

    if (props.config?.payload) {
      const context = app.useContext(props.scope?.row || props.model)
      modelData = appUtil.getActionPayload(props.config?.payload, context)
    } else if (!modelData) {
      if (!props.scope?.row) {
        modelData = {}
      } else {
        modelData = _.omit(_.deepClone(props.scope.row), ['__innerTexts'])
      }
    }

    formModel.value = modelData
  },
  { immediate: true }
)

function handleCancel() {
  cancel()
}

function handleSubmit() {
  submit()
}

function cancel() {
  emit('cancel', formModel.value, props)
  isVisible.value = false
}

function submit() {
  emit('submit', formModel.value, props)
  isVisible.value = false
}
</script>

<style lang="scss" scoped>
.body-content {
  padding: 0;

  & > .title {
    font-weight: bold;
    padding: 5px;
  }
}
.reference-content {
  width: 100%;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reference-icon {
  cursor: pointer;
  color: #3693ff;
  vertical-align: middle;
  margin-right: 5px;
}

.pop-editor-mask {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.1);
}
</style>

<!-- 全局 el-popper样式调整 -->
<style lang="scss">
.el-popper {
  max-width: 800px;
}
</style>

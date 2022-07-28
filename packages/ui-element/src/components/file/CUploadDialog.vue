<template>
  <el-dialog
    v-if="uploadState.isShowDialog"
    v-model="uploadState.isShowDialog"
    custom-class="c-upload-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :title="title"
    width="500px"
    footer-hide
    append-to-body
  >
    <div class="upload-panel-con">
      <c-upload-panel
        ref="uploadPanelRef"
        :accept="uploadProps.accept"
        :multiple="uploadProps.multiple"
        @completed="handleUploadCompleted"
        @items-change="handleItemsChange"
      />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <div class="footer-tip">
          <p v-if="!uploadProps.multiple">提示：若只支持单个文件上传，再次上传会进行覆盖</p>
          <slot name="tip">
            <span v-if="tip">{{ tip }}</span>
          </slot>
        </div>
        <div class="footer-action flex">
          <div class="flex-center">
            <span v-if="isAllCanceled">已取消</span>
            <span v-else-if="isAllCompleted" class="text-positive">已完成</span>
            <span v-else-if="isUploading" class="text-active">上传中</span>
          </div>
          <div class="flex-main">
            <c-file-trigger
              ref="fileUpload"
              :accept="uploadProps.accept"
              :multiple="uploadProps.multiple"
              @selected="handleFilesSelected"
            >
              <el-button v-if="uploadProps.multiple" v-preventReclick>添加文件</el-button>
              <el-button v-else v-preventReclick>选择文件</el-button>
            </c-file-trigger>
            <el-button
              v-if="isItemsReadyForUpload"
              class="q-ml-md"
              :loading="isUploading"
              type="primary"
              v-preventReclick
              @click="handleUploadClick"
            >
              开始上传
            </el-button>
            <el-button v-else class="q-ml-md" v-preventReclick @click="handleCloseClick">关闭</el-button>
          </div>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from '@zto/zpage'
import { checkIsReadyForUpload, parseFileName } from './util'

import type { UploadOpenParams, UploadDataItems, UploadData } from './types'

const props = withDefaults(
  defineProps<{
    title: string
    tip: string | boolean | Record<string, any>
  }>(),
  {}
)

const emit = defineEmits(['close', 'completed', 'uploaded', 'all-completed'])

const uploadPanelRef = ref()

const uploadProps = reactive<{
  accept?: string
  multiple?: boolean
  params?: any
}>({
  accept: '',
  multiple: false,
  params: {}
})

const uploadState = reactive<{
  items: UploadDataItems
  isShowDialog: boolean
}>({
  items: {},
  isShowDialog: false
})

const uploadItemVals = computed(() => {
  return Object.values(uploadState.items || {})
})

const noUploadItems = computed(() => {
  return !uploadItemVals.value.length
})

// 存在任何准备好上传的节点
const isItemsReadyForUpload = computed(() => {
  if (noUploadItems.value) return false

  return uploadItemVals.value.some((item: UploadData) => {
    return checkIsReadyForUpload(item)
  })
})

// 是否全部取消
const isAllCanceled = computed(() => {
  if (noUploadItems.value) return false

  const canceled = uploadItemVals.value.every((it: UploadData) => it.canceled)
  return canceled
})

// 是否全部完成
const isAllCompleted = computed(() => {
  if (noUploadItems.value) return false

  const completed = uploadItemVals.value.every((it: UploadData) => {
    return it.completed || it.canceled
  })

  return completed
})

// 正在上传
const isUploading = computed(() => {
  if (isAllCompleted.value) return false

  const uploading = uploadItemVals.value.some((it: UploadData) => {
    return it.uploading
  })

  return uploading
})

watch(
  () => uploadState.isShowDialog,
  (visible: boolean) => {
    if (!visible) onClose()
  },
  { immediate: true }
)

function onClose() {
  reset()
  emit('close')
}

function handleUploadClick() {
  uploadPanelRef.value.startUpload()
}

function handleItemsChange(items: UploadDataItems) {
  uploadState.items = items
}

function handleUploadCompleted(item: UploadData, res: any) {
  nextTick(() => {
    const result: any = parseFileName(res.fileName)
    result.url = res.url

    //如果用随机 可能result返回的那个会有多个不能去重复没有处理
    if (item.file) result.fname = item.file.name

    // 用于upload组件接收
    emit('completed', result, item, uploadState.items, uploadProps.params)

    // 一般用于外部调用
    emit('uploaded', result, uploadProps.params)

    if (isAllCompleted.value) {
      emit('all-completed', uploadState.items, uploadProps.params)
    }
  })
}

function handleFilesSelected(files: File[]) {
  if (!files?.length) return
  if (!uploadProps.multiple) reset()

  // 转换未文件数组
  let _files = Array.prototype.map.call(files, (file: File) => {
    return file
  }) as File[]

  uploadPanelRef.value?.addFiles(_files)
}

function handleCloseClick() {
  close()
}

function open(params: UploadOpenParams) {
  uploadState.isShowDialog = true
  uploadProps.accept = params.accept
  uploadProps.multiple = params.multiple
  uploadProps.params = params.params

  nextTick(() => {
    uploadPanelRef.value.load(params)
  })
}

function close() {
  uploadState.isShowDialog = false
  uploadProps.accept = ''
  uploadProps.multiple = false
}

function reset() {
  uploadPanelRef.value?.reset()
}

defineExpose({
  open,
  close,
  reset
})
</script>

<style lang="scss" scoped>
.c-upload-dialog {
  .upload-panel-con {
    max-height: 50px;
    padding: 10px;
    max-height: 50vh;
    overflow-y: auto;
  }

  .footer-tip {
    text-align: left;
    margin-bottom: 10px;
  }
}
</style>

<style lang="scss">
.c-upload-dialog > .el-dialog__body {
  padding: 0;
}
</style>

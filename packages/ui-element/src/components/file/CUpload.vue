<template>
  <div class="c-upload">
    <c-file-upload
      v-bind="uploadAttrs"
      :multiple="multiple"
      :count-limit="innerCountLimit"
      :size-limit="sizeLimit"
      :accept="accept"
      :close-when-completed="closeWhenCompleted"
      :auto-upload="autoUpload"
      :open-file="openFile"
      :tip="tip"
      :disabled="isDisabled"
      @completed="handleUploadCompleted"
    ></c-file-upload>
    <div class="file-list">
      <c-file-list
        :model-value="uploadState.fileList"
        v-bind="listAttrs"
        :src-type="srcType"
        :list-type="listType"
        :remote-delete="innerRemoteDelete"
        @delete="handleFileDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { _, vue } from '@zto/zpage'
import { fileUtil, GenericFunction, useConfig } from '@zto/zpage-runtime'

import type { UploadFileItem } from './types'

const { ref, watch, reactive, computed } = vue

const props = withDefaults(
  defineProps<{
    modelValue?: Array<UploadFileItem> | UploadFileItem | string
    fileName?: string
    valueType: string // 'data' | 'string'
    srcType?: string // 'path' | 'url'
    listType?: string

    returnName?: boolean
    remoteDelete?: boolean

    multiple?: boolean
    countLimit?: number
    sizeLimit?: number
    accept?: string
    openFile?: boolean
    closeWhenCompleted?: boolean
    autoUpload?: boolean
    tip?: boolean | string | Record<string, any>
    uploadAttrs?: Record<string, any>
    listAttrs?: Record<string, any>
    disabled?: boolean
    onCompleted?: GenericFunction
    onDelete?: GenericFunction
  }>(),
  {
    valueType: 'string',
    srcType: 'path',
    returnName: false,
    multiple: true,
    countLimit: 10,
    openFile: true,
    closeWhenCompleted: true,
    autoUpload: false,
    disabled: false
  }
)

const emit = defineEmits(['update:modelValue', 'update:name', 'change', 'completed', 'deleted'])

const uploadConfig = useConfig('components.file.upload', {})

const uploadState = reactive<{
  fileList: UploadFileItem[]
}>({
  fileList: []
})

const innerCountLimit = computed(() => {
  return props.countLimit - uploadState.fileList.length
})

const isDisabled = computed(() => {
  return props.disabled || innerCountLimit.value <= 0
})

const innerRemoteDelete = computed(() => {
  if (_.isBoolean(props.remoteDelete)) return props.remoteDelete
  if (_.isBoolean(uploadConfig.remoteDelete)) return uploadConfig.remoteDelete

  return true
})

watch(
  () => [props.modelValue, props.fileName, props.srcType],
  () => {
    const fileVals: any = props.multiple === false ? [props.modelValue] : props.modelValue || []
    const fileList = fileVals.map((it: any) => parseFileItem(it)).filter((it: any) => !!it)

    if (!_.deepEqual(uploadState.fileList, fileList)) {
      uploadState.fileList = fileList
    }
  },
  {
    immediate: true
  }
)

watch(
  () => uploadState.fileList,
  () => {
    const fileList = uploadState.fileList || []

    const vals: any[] = fileList.map(it => parseFileValue(it))
    const val = props.multiple ? vals : vals[0]

    emit('update:modelValue', val)
    emit('change', val)

    if (props.returnName && props.multiple === false) {
      emit('update:name', fileList[0]?.name)
    }
  }
)
// 文件上传完成
async function handleUploadCompleted(e: any) {
  let fileList = props.multiple === false ? [] : uploadState.fileList || []

  const targetFile = {
    name: e.fname,
    path: e.fullpath,
    url: e.url
  }

  fileList.push(targetFile)

  if (props.onCompleted) {
    await Promise.resolve().then(() => props.onCompleted!(targetFile))
  }

  emit('completed', targetFile)

  uploadState.fileList = [...fileList]
}

// 文件删除
async function handleFileDelete(item: any, index: number) {
  if (innerRemoteDelete.value && item.path) {
    await fileUtil.deleteFile(item.path)
  }

  if (props.onDelete) {
    await Promise.resolve().then(() => props.onDelete!(item, index))
  }

  const fileList = uploadState.fileList || []
  fileList.splice(index, 1)

  emit('deleted', item, index)

  uploadState.fileList = [...fileList]
}

// 解析文件值
function parseFileValue(fileItem: UploadFileItem): UploadFileItem | string {
  if (props.valueType === 'string') {
    if (props.srcType === 'url') {
      return fileItem.url as string
    } else {
      return fileItem.path as string
    }
  } else {
    if (props.srcType === 'url') {
      return { name: fileItem.name, url: fileItem.url }
    } else {
      return { name: fileItem.name, path: fileItem.path }
    }
  }
}

// 解析文件数据
function parseFileItem(fileVal: UploadFileItem | string): UploadFileItem | null {
  if (!fileVal) return null

  let fileItem: any = fileVal

  if (props.valueType === 'string') {
    if (props.srcType === 'path') {
      fileItem = { path: fileVal }
    } else if (props.srcType === 'url') {
      fileItem = { url: fileVal }
    }
  }

  if (props.multiple === false && props.fileName) {
    fileItem.name = props.fileName
  }

  return fileItem
}
</script>

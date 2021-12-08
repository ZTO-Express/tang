<template>
  <div class="c-file-upload">
    <div class="c-file-upload--trigger">
      <template v-if="openFile">
        <c-file-trigger
          :disabled="disabled"
          :accept="uploadAccept"
          :multiple="multiple"
          @selected="handleFilesSelected"
        >
          <slot>
            <el-button :type="buttonType" :disabled="disabled" :icon="buttonIcon || ''">
              <span>{{ buttonText }}</span>
            </el-button>
          </slot>
        </c-file-trigger>
        <upload-tip v-if="tip" v-bind="tipAttrs" />
      </template>
      <template v-else>
        <slot>
          <el-button :type="buttonType" :disabled="disabled" :icon="buttonIcon || ''" @click="openUpload">
            <span>{{ buttonText }}</span>
          </el-button>
        </slot>
      </template>
    </div>

    <c-upload-dialog
      ref="uploadDialogRef"
      v-bind="$attrs"
      :title="dialogTitle"
      :store-group="storeGroup"
      @completed="handleUploadCompleted"
      @all-completed="handleUploadAllCompleted"
    />
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue } from '@zto/zpage'
import { RescMimeTypes } from './util'

import UploadTip from './upload-tip.vue'

import type { PromiseFunction } from '@zto/zpage'
import type { RescType, UploadOpenOptions, UploadData, UploadDataItems, UploadStoreGroup } from './types'
import type { UploadStoreOptions } from '../../utils/upload'

const { ref, reactive, computed, watch, nextTick } = vue

const props = withDefaults(
  defineProps<{
    dialogTitle: string
    disabled: boolean
    buttonText: string
    buttonType: string
    buttonIcon: string | boolean
    rescType: RescType // 资源类型
    accept: string // 接收的文件类型
    multiple: boolean
    closeWhenCompleted: boolean
    autoOpenDialog: boolean
    autoUpload: boolean
    openFile: boolean
    sizeLimit: number // 文件大小限制, 默认5，单位MB
    countLimit: number // 一次上传文件数限制（默认20）
    storePath: string
    storeGroup: UploadStoreGroup
    storeOptions: UploadStoreOptions
    onUploaded: PromiseFunction
    uploadParams: any // 上传时附加的参数
    tip: boolean | string | Record<string, any>
  }>(),
  {
    dialogTitle: '文件上传',
    disabled: false,
    buttonText: '上传',
    buttonType: 'primary',
    buttonIcon: false,
    storeGroup: 'private',
    rescType: 'file',
    accept: '',
    multiple: true,
    closeWhenCompleted: true,
    autoOpenDialog: true,
    autoUpload: false,
    tip: false
  }
)

const emit = defineEmits(['selected', 'completed', 'all-completed'])

const uploadDialogRef = ref()

const openUploadOptions = ref<UploadOpenOptions>({})

const tipAttrs = computed(() => {
  if (props.tip === false) return {}

  let tip = {}
  if (typeof tip === 'string') {
    tip = { content: tip }
  } else if (typeof tip === 'object') {
    tip = { ...tip }
  }

  tip = { ...props, ...tip }

  return tip
})

const uploadAccept = computed(() => {
  let accept = props.accept

  if (!accept && props.rescType) {
    accept = RescMimeTypes[props.rescType]
  }

  return accept
})

function handleFilesSelected(files: File[]) {
  if (!files || !files.length) return

  let _files = Array.prototype.map.call(files, (file: File) => {
    return file
  }) as File[]

  if (props.multiple) {
    emit('selected', _files)
  } else {
    emit('selected', _files[0])
  }

  if (props.autoOpenDialog) openUpload(_files)
}

function handleUploadCompleted(result: any) {
  nextTick(() => {
    if (result.fullpath) {
      emit('completed', result, props.uploadParams)
    }
  })
}

function handleUploadAllCompleted(items: UploadDataItems) {
  emit('all-completed', items)

  if (props.closeWhenCompleted) {
    setTimeout(() => {
      uploadDialogRef.value.close()
    }, 100)
  }
}

function openUpload(files: File[], options?: UploadOpenOptions) {
  openUploadOptions.value = options || {}

  uploadDialogRef.value.open({
    files,
    rescType: props.rescType,
    accept: uploadAccept.value,
    multiple: props.multiple,
    sizeLimit: props.sizeLimit,
    countLimit: props.countLimit,
    autoUpload: props.autoUpload,
    storePath: props.storePath,
    storeGroup: props.storeGroup,
    storeOptions: props.storeOptions,
    onUploaded: onFileUploaded
  })
}

async function onFileUploaded(item: UploadData, result: any) {
  if (props.onUploaded) return props.onUploaded(item, result)
  return result
}
</script>

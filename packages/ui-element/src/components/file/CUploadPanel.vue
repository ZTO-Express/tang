<template>
  <div class="c-upload-panel">
    <div class="panel-body">
      <div v-if="!noItems" class="upload-items">
        <div v-for="(it, key) in uploadState.items" :key="key" class="q-mb-sm">
          <upload-item
            :data="it"
            :no-cancel="!multiple"
            @cancel="handleItemUploadCancel"
            @remove="handleItemUploadRemove"
          />
        </div>
      </div>
      <div v-else class="no-data">
        <div class="notice">请先选择要上传的文件</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { computed, reactive, watch } from '@zto/zpage'
import { useMessage } from '../../composables'
import { uploadUtil } from '../../utils'

import { isSameFile, getFileThumbnail, checkIsReadyForUpload } from './util'

import UploadItem from './upload-item.vue'

import type { GenericFunction } from '@zto/zpage'
import type { UploadStoreOptions } from '../../utils/upload'
import type { UploadData, UploadDataItems, UploadOpenParams } from './types'

const { Message } = useMessage()

const props = withDefaults(
  defineProps<{
    accept: string
    multiple?: boolean
  }>(),
  {
    accept: '',
    multiple: false
  }
)

const emit = defineEmits(['items-change', 'completed', 'uploaded'])

const uploadProps = reactive<{
  sizeLimit: number // 上传文件大小限制(MB)
  countLimit: number // 上传数量限制
  autoUpload: boolean
  storePath: string | undefined
  storeGroup: string | undefined
  storeOptions?: UploadStoreOptions
  onUploaded: GenericFunction | undefined
}>({
  sizeLimit: 5,
  countLimit: 20,
  autoUpload: false,
  storePath: '',
  storeGroup: 'private',
  storeOptions: {},
  onUploaded: undefined
})

const uploadState = reactive<{
  items: UploadDataItems
}>({
  items: {}
})

const uploadItemKeys = computed(() => {
  return Object.keys(uploadState.items || {})
})

const uploadItemVals = computed(() => {
  return Object.values(uploadState.items || {})
})

const noItems = computed(() => {
  return !uploadItemKeys.value.length
})

// 大小限制（byte）
const sizeLimitByte = computed(() => {
  return !uploadProps.sizeLimit ? 0 : uploadProps.sizeLimit * 1024 * 1024
})

watch(
  () => uploadItemKeys.value,
  () => {
    emit('items-change', uploadState.items)
  },
  { immediate: true }
)

function handleItemUploadCancel(item: UploadData) {
  if (!item?.key) return

  if (item.uploading) {
    cancelUpload(item)
    resetItem(item)
  } else {
    handleItemUploadRemove(item)
  }
}

function handleItemUploadRemove(item: UploadData) {
  if (!item?.key) return

  // 取消上传
  if (item.subscription) item.subscription.unsubscribe()
  delete uploadState.items[item.key]
}

function load(params: UploadOpenParams) {
  uploadProps.autoUpload = params.autoUpload === true
  uploadProps.sizeLimit = params.sizeLimit || uploadProps.sizeLimit
  uploadProps.countLimit = params.countLimit || uploadProps.countLimit
  uploadProps.storePath = params.storePath
  uploadProps.storeGroup = params.storeGroup
  uploadProps.storeOptions = params.storeOptions
  uploadProps.onUploaded = params.onUploaded

  addFiles(params.files)
}

async function addFiles(files: File[] | undefined) {
  if (!files || !files.length) return

  // 过滤掉已存在的文件
  let items = uploadState.items || {}
  let addFileOps: Promise<any>[] = []

  let uploadParams: any = {
    existsFiles: 0
  }

  let fileKey = +new Date()

  const currentCountLimit = uploadProps.countLimit - uploadItemVals.value.length
  if (uploadProps.countLimit && files.length > currentCountLimit) {
    Message.warning(`一次只能添加${uploadProps.countLimit}个文件。`)
    files = files.slice(0, currentCountLimit)
  }

  files.forEach((file, index) => {
    fileKey++
    addFileOps.push(addFile(uploadState.items, file, String(fileKey), uploadParams))
  })

  await Promise.all(addFileOps)

  if (uploadParams.existsFile) {
    Message.warning('文件已存在。')
  }

  uploadState.items = items || {}

  if (uploadProps.autoUpload) startUpload()
}

async function addFile(items: UploadDataItems, file: File, key: string, params: any) {
  let itemsArr = Object.values(items)
  let exists = itemsArr.some(it => {
    return isSameFile(it.file, file)
  })

  if (exists) {
    params.existsFile++
    return
  }

  let item: UploadData = { key, file, loading: true }
  items[key] = item

  resetItem(item)

  if (sizeLimitByte && file.size > sizeLimitByte.value) {
    item.fsizeExceeded = true
    item.canceled = true
    item.loading = false
    item.errorMsg = `文件大小超过最大限制${uploadProps.sizeLimit}M`
  } else {
    let thumbnail = await getFileThumbnail(file)
    item.loading = false
    item.thumbnail = thumbnail
  }

  items[key] = item
  resetItem(item)
}

async function startUpload() {
  let uploadOps = uploadItemVals.value.map(it => {
    return upload(it)
  })
  await Promise.all(uploadOps)
}

async function upload(item: UploadData) {
  if (!item.file || !checkIsReadyForUpload(item)) return

  item.uploading = true

  // 上传管理器
  return uploadUtil
    .upload(item.file, {
      onProgress: onUploadProgress(item),
      onUpload: onUploadStart(item),
      storePath: uploadProps.storePath,
      storeGroup: uploadProps.storeGroup,
      storeOptions: uploadProps.storeOptions
    })
    .then((res: any) => {
      item.progress = 100
      item.uploading = false

      let result = res.result

      emit('uploaded', item, result, res)

      if (uploadProps.onUploaded) {
        return uploadProps.onUploaded(item, result, res).then((e: any) => onUploadCompleted(item, result))
      } else {
        onUploadCompleted(item, result)
      }
    })
    .catch((error: any) => {
      if (error && error.noBreaking) {
        item.uploading = false
        return
      }

      item.uploading = false
      item.errorMsg = '上传错误'

      if (error) {
        if (typeof error === 'string') {
          item.errorMsg = error
        } else if (error.message) {
          item.errorMsg = error.message
        }
      }

      resetItem(item)
    })
}

function onUploadProgress(item: UploadData) {
  return (res: any) => {
    if (res && res.total) {
      item.progress = parseInt(res.total.percent)
      resetItem(item)
    }
  }
}

function onUploadStart(item: UploadData) {
  return ({ subscription }: any) => {
    if (item && subscription) {
      item.subscription = subscription
    }
  }
}

function onUploadCompleted(item: UploadData, result?: any) {
  emit('completed', item, result)
  item.completed = true
  resetItem(item)
}

function resetItem(item: UploadData) {
  if (!item?.key) return

  item = Object.assign({}, item)
  uploadState.items[item.key] = item
}

function reset() {
  uploadProps.autoUpload = false
  uploadProps.onUploaded = undefined

  cancelAllUploads()

  uploadState.items = {}
}

function cancelAllUploads() {
  uploadItemVals.value.forEach(it => {
    cancelUpload(it)
  })
}

function cancelUpload(item: UploadData) {
  if (!item) return

  // 取消上传
  if (item.subscription) {
    item.subscription.unsubscribe()
    item.subscription = undefined
  }

  item.canceled = true
  item.uploading = false
  item.errorMsg = '已取消上传'
}

defineExpose({
  load,
  reset,
  addFiles,
  startUpload
})
</script>

<style lang="scss" scoped>
.c-upload-panel {
  padding: 10px;
}

.c-inner-upload {
  height: 0;
}

.panel-body {
  min-height: 120px;
  position: relative;

  .no-data {
    box-sizing: border-box;
    position: absolute;
  }
}
</style>

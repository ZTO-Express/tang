<template>
  <uploader
    :model-value="fileListItems"
    v-bind="$attrs"
    :accept="innerAccept"
    :max-count="innerCountLimit"
    :max-size="sizeLimitByte"
    :disabled="disabled"
    :upload-icon="innerUploadIcon"
    :preview-options="innerPreviewOptions"
    :after-read="handleAfterRead"
    @delete="handleFileDelete"
    @oversize="handleOversize"
  ></uploader>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { _, vue, useConfig, fileUtil } from '@zto/zpage'
import { Uploader } from 'vant'

import { uploadUtil } from '../../utils'
import { useMessage } from '../../composables'
import { isSameFile, getFileThumbnail, getFileUrls, checkIsReadyForUpload, getUrlThumbnail } from './util'
import { UploadStatus, UploadStatusInfo } from './types'

import type { GenericFunction, PromiseFunction } from '@zto/zpage'
import type { UploadStoreOptions } from '../../utils/upload'
import type { UploadData, UploadDataItems, UploadFileItem, UploadStoreGroup } from './types'

const { watch, reactive, computed } = vue

const { Message } = useMessage()

const props = withDefaults(
  defineProps<{
    modelValue?: Array<UploadFileItem> | UploadFileItem | string
    fileName?: string
    valueType?: string // 'data' | 'string'
    srcType?: string // url/id
    rescType?: string // image,file,video,office
    uploadIcon?: string

    returnName?: boolean
    remoteDelete?: boolean

    multiple?: boolean
    countLimit?: number
    sizeLimit?: number
    accept?: string
    capture?: string // camera或空
    previewOptions?: any
    disabled?: boolean

    storePath?: string
    storeGroup?: UploadStoreGroup
    storeOptions?: UploadStoreOptions
    uploadParams?: any // 上传时附加的参数

    onUploaded?: PromiseFunction
    onDelete?: GenericFunction
    onCompleted?: GenericFunction
  }>(),
  {
    valueType: 'string',
    srcType: 'id',
    rescType: 'image',

    returnName: false,

    multiple: true,
    countLimit: 10,
    sizeLimit: 5,

    storeGroup: 'private',

    disabled: false
  }
)

const emit = defineEmits(['update:modelValue', 'update:name', 'change', 'uploaded', 'completed', 'deleted', 'oversize'])

const uploadConfig = useConfig('components.file.upload', {})

const uploadState = reactive<{
  items: UploadDataItems
}>({
  items: {}
})

/** 支持远程删除 */
const innerRemoteDelete = computed(() => {
  if (_.isBoolean(props.remoteDelete)) return props.remoteDelete
  if (_.isBoolean(uploadConfig.remoteDelete)) return uploadConfig.remoteDelete

  return true
})

/** 数量限制（非多选，数量限制强制为1） */
const innerCountLimit = computed(() => {
  return props.multiple === false ? 1 : props.countLimit
})

/** 大小限制（byte） */
const sizeLimitByte = computed(() => {
  return props.sizeLimit * 1024 * 1024
})

/** 输入选项 */
const UploadRescOption = computed(() => {
  return uploadUtil.getUploadRescOption(props.rescType || 'image')
})

/** 支持上传文件类型 */
const innerAccept = computed(() => {
  if (props.accept) return props.accept
  return UploadRescOption.value.accept
})

/** 上传icon */
const innerUploadIcon = computed(() => {
  if (props.uploadIcon) return props.uploadIcon
  if (props.capture === 'camera') return 'photograph'
  return UploadRescOption.value.icon
})

const innerPreviewOptions = computed(() => {
  const options = { closeable: true, ...props.previewOptions }
  return options
})

/** 上传地址 */
const fileListItems = computed(() => {
  const isImage = props.rescType === 'image'

  const items = Object.keys(uploadState.items).map((key) => {
    const it = uploadState.items[key]
    const statusInfo = getUploadStatusInfo(it) as any
    return { key: it.key, url: it.thumbnail, status: statusInfo.status, message: statusInfo.message, isImage }
  })

  return items
})

watch(
  () => [props.modelValue, props.fileName, props.srcType],
  async () => {
    const fileVals: any = props.multiple === false ? [props.modelValue] : props.modelValue || []
    const fileItems = fileVals.map((it: any) => parseFileItem(it)).filter((it: any) => !!it)

    if (!_.deepEqual(uploadState.items, fileItems)) {
      uploadState.items = await parseUploadDataItems(fileItems)
    }
  },
  {
    immediate: true
  }
)

/** 执行文件上传 */
async function handleAfterRead(fileInfo: any) {
  if (!fileInfo.file) return

  const item = await addFile(uploadState.items, fileInfo.file)

  if (!item) return

  await upload(item)
}

/** 新增文件 */
async function addFile(items: UploadDataItems, file: File) {
  let itemsArr = Object.values(items)
  let exists = itemsArr.some((it) => isSameFile(it.file, file))

  if (exists) {
    Message.fail('文件已存在。')
    return
  }

  const key = String(+new Date())
  let item: UploadData = { key, file, status: UploadStatus.loading }
  items[key] = item

  resetItem(item)

  if (sizeLimitByte.value && file.size > sizeLimitByte.value) {
    item.fsizeExceeded = true
    item.status = UploadStatus.failed
    item.message = `文件大小超过最大限制${props.sizeLimit}M`
  } else {
    let thumbnail = await getFileThumbnail(file)
    item.status = UploadStatus.loaded
    item.thumbnail = thumbnail
  }

  items[key] = item
  resetItem(item)

  return item
}

/** 操作大小处理 */
async function handleOversize(file: any) {
  Message.fail(`文件大小超过最大限制${props.sizeLimit}M`)
  emit('oversize', file)
}

/** 文件删除 */
async function handleFileDelete(file: any) {
  const itemKey = file.key

  if (!itemKey || !uploadState.items[itemKey]) return

  const item = uploadState.items[itemKey]

  if (innerRemoteDelete.value && item.id) {
    await fileUtil.deleteFile(item.id)
  }

  if (props.onDelete) {
    await Promise.resolve().then(() => props.onDelete!(item))
  }

  delete uploadState.items[item.key]

  emit('deleted', item)

  triggerChange()
}

function upload(item: UploadData) {
  if (!item.file || !checkIsReadyForUpload(item)) return

  item.status = UploadStatus.uploading

  // 上传管理器
  return uploadUtil
    .upload(item.file, {
      onProgress: onUploadProgress(item),
      onUpload: onUploadStart(item),
      storePath: props.storePath,
      storeGroup: props.storeGroup,
      storeOptions: props.storeOptions
    })
    .then((res: any) => {
      item.progress = 100
      item.status = UploadStatus.uploaded

      let result = res.result

      emit('uploaded', item, result, res)

      if (props.onUploaded) {
        return props.onUploaded(item, result, res).then((e: any) => onUploadCompleted(item, result))
      } else {
        return onUploadCompleted(item, result)
      }
    })
    .catch((error: any) => {
      item.status = UploadStatus.failed

      if (!error || !error.noBreaking) {
        item.message = '上传错误'

        if (error) {
          item.errorMessage = typeof error === 'string' ? error : error.message
          Message.fail(item.errorMessage || '上传错误')
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

async function onUploadCompleted(item: UploadData, result?: any) {
  if (result) {
    item.id = result.id
    if (props.storeGroup === 'public') item.url = result.url

    //如果用随机 可能result返回的那个会有多个不能去重复没有处理
    if (item.file) item.name = item.file.name
  }

  item.status = UploadStatus.done
  resetItem(item)

  if (props.onCompleted) {
    await Promise.resolve().then(() => props.onCompleted!(item))
  }

  emit('completed', item, result)

  triggerChange()
}

function resetItem(item: UploadData) {
  if (!item?.key) return

  item = Object.assign({}, item)
  uploadState.items[item.key] = item
}

// 出发修改
async function triggerChange() {
  const fileItems = uploadState.items || {}

  const vals: any[] = Object.keys(fileItems).map((key) => parseFileValue(fileItems[key]))
  const val = props.multiple ? vals : vals[0]

  emit('update:modelValue', val)
  emit('change', val)

  if (props.returnName && props.multiple === false) {
    emit('update:name', fileItems[0]?.name)
  }
}

/** 上传文件项为上传文件数据项 */
async function parseUploadDataItems(fileItems: UploadFileItem[]): Promise<UploadDataItems> {
  let urls: string[] = []
  if (props.storeGroup === 'private' && props.srcType === 'id') {
    const ids = fileItems.map((it) => it.id) as string[]

    urls = await getFileUrls(ids)

    const ops = urls.map((url, index) => {
      return getUrlThumbnail(url).then((thumbnail) => {
        fileItems[index].url = url
        fileItems[index].thumbnail = thumbnail
      })
    })

    await Promise.all(ops)
  }

  const dataItems: UploadDataItems = {}
  const ts = +new Date()

  fileItems.forEach((it, index) => {
    const key = String(ts + index)

    dataItems[key] = {
      key,
      id: it.id,
      name: it.name,
      url: it.url,
      thumbnail: it.thumbnail,
      status: UploadStatus.done
    }
  })

  return dataItems
}

// 获取上传状态
function getUploadStatusInfo(it: UploadData): UploadStatusInfo {
  const statusInfo: UploadStatusInfo = {
    status: '',
    message: ''
  }

  switch (it.status) {
    case UploadStatus.loading:
    case UploadStatus.loaded:
    case UploadStatus.uploading:
    case UploadStatus.uploaded:
      statusInfo.status = 'uploading'
      statusInfo.message = '上传中...'
      break
    case UploadStatus.canceled:
    case UploadStatus.failed:
      statusInfo.status = 'failed'
      statusInfo.message = '上传失败'
      break
    case UploadStatus.done:
      statusInfo.status = 'done'
      statusInfo.message = '上传成功'
      break
  }

  return statusInfo
}

// 解析文件值
function parseFileValue(fileItem: UploadFileItem): UploadFileItem | string {
  if (props.valueType === 'string') {
    if (props.srcType === 'url') {
      return fileItem.url as string
    } else {
      return fileItem.id as string
    }
  } else {
    if (props.srcType === 'url') {
      return { name: fileItem.name, url: fileItem.url }
    } else {
      return { name: fileItem.name, id: fileItem.id }
    }
  }
}

// 解析文件数据
function parseFileItem(fileVal: UploadFileItem | string): UploadFileItem | null {
  if (!fileVal) return null

  let fileItem: any = fileVal

  if (props.valueType === 'string') {
    if (props.srcType === 'id') {
      fileItem = { id: fileVal }
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

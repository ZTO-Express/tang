<template>
  <div class="c-file-list">
    <slot v-if="!listState.items?.length" name="empty">
      <div v-if="showNoData" class="no-data" :class="{ 'no-padding': noPadding }">
        <slot name="no-data">暂无文件</slot>
      </div>
    </slot>
    <div v-else class="file-items">
      <template v-for="(it, index) in listState.items">
        <slot name="item" v-bind="{ _index: index, ...it }">
          <div :key="index" class="file-item" :title="it.name">
            <div v-if="listType === 'image'" class="image-item" :class="{ isDownloadable }">
              <c-image v-bind="imageAttrs" class="image" :src="srcType === 'url' ? it.url : it.path" />
              <div v-if="isDownloadable" class="action-mask flex-center">
                <el-button
                  v-if="!readonly"
                  class="btn-image-download"
                  type="text"
                  icon="el-icon-bottom"
                  @click="handleLink(it)"
                />
              </div>
            </div>
            <div v-else class="text-item">
              <div v-if="isDownloadable" class="file-list-item-btn" @click="handleLink(it)">
                <div class="label text-ellipsis" :style="{ maxWidth: maxItemWidth }">{{ it.name }}</div>
              </div>
              <div v-else class="label text-ellipsis" :style="{ maxWidth: maxItemWidth }">{{ it.name }}</div>
            </div>

            <el-button
              v-if="!readonly"
              class="btn-delete"
              type="info"
              icon="el-icon-close"
              circle
              @click="handleDelete(index)"
            />
          </div>
        </slot>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { _, vue, fileUtil } from '@zto/zpage'

import type { GenericFunction } from '@zto/zpage'
import type { UploadFileItem } from './types'

const { ref, watch, reactive, computed } = vue

const props = withDefaults(
  defineProps<{
    modelValue?: Array<any> | string
    readonly?: boolean
    downloadable?: boolean
    noPadding?: boolean
    showNoData?: boolean
    withoutPostfix?: boolean
    maxItemWidth?: string
    srcType?: string // 'path' | 'url'
    listType?: string // 'image' | 'file'
    imageOptions?: Record<string, any> // 图片选项
    downloadMethod?: GenericFunction
    remoteDelete?: boolean // 远程删除
    immediateDelete?: boolean // 删除操作时，直接删除指定项
    params?: string // 额外的参数
  }>(),
  {
    srcType: 'path',
    showNoData: false,
    maxItemWidth: '200px',
    remoteDelete: true,
    immediateDelete: false,
    listType: 'file'
  }
)

const emit = defineEmits(['update:modelValue', 'delete', 'deleted'])

const listState = reactive<{
  items: UploadFileItem[]
}>({
  items: []
})

const imageAttrs = computed(() => {
  const _attrs = { ...props.imageOptions }
  return _attrs
})

const isDownloadable = computed(() => {
  if (typeof props.downloadable === 'boolean') return props.downloadable
  if (props.listType === 'image') return false
  return true
})

watch(
  () => props.modelValue,
  () => {
    resetFileItems(props.modelValue)
  },
  {
    immediate: true
  }
)

async function handleDelete(index: number) {
  const item = listState.items[index]

  if (item) {
    if (props.immediateDelete) await deleteItem(item)
    emit('delete', item, index, props.params)
  }
}

function handleLink(it: UploadFileItem) {
  innerDownloadMethod(it)
}

async function innerDownloadMethod(it: UploadFileItem) {
  const options = {
    filename: it.name,
    withoutPostfix: props.withoutPostfix
  }

  if (props.downloadMethod) {
    props.downloadMethod(it, options)
  } else {
    let url = it.url
    if (props.srcType === 'path' && it.path) {
      url = await fileUtil.getUrlByPath(it.path)
    }

    if (url) {
      await fileUtil.download(url, options)
    }
  }
}

async function deleteItem(item: UploadFileItem | number) {
  let index: any = undefined

  if (typeof item === 'number') {
    index = item
    item = listState.items[index]
  } else {
    index = listState.items.indexOf(item)
  }

  if (item && index >= 0) {
    if (props.remoteDelete && item.path) {
      await fileUtil.deleteFile(item.path)
    }

    listState.items.splice(index, 1)
    emit('deleted', item)

    const val = getModelValue()
    emit('update:modelValue', val)
  }
}

function resetFileItems(val: any[] | string | undefined) {
  let items: any[] = []

  if (_.isString(val)) {
    items = val.split(',')
  } else if (val) {
    items = val
  }

  if (!items?.length) {
    listState.items = []
    return
  }

  listState.items = items
    .filter(it => !!it)
    .map((it: any) => {
      let item: any = it

      if (_.isString(it)) {
        if (props.srcType === 'url') {
          item = { url: it }
        } else {
          item = { path: it }
        }
      }

      const url = item.url

      let name = item.name
      let path = item.path

      if (!name) {
        let fileName = props.srcType === 'url' ? item.url : item.path
        const { fname } = fileUtil.parseFileName(fileName)
        name = fname
      }

      return { name, path, url }
    })
}

function getModelValue() {
  if (_.isString(props.modelValue)) {
    const items = (listState.items || []).map(it => {
      return props.srcType === 'url' ? it.url : it.path
    })

    return items.join()
  }
  return [...listState.items]
}
</script>

<style lang="scss" scoped>
$image-size: 80px;

.c-file-list {
  display: inline-block;
  border-radius: 3px;

  .file-items {
    padding: 5px 10px 5px 0;
    display: flex;
    flex-wrap: wrap;
  }

  .file-item {
    position: relative;
    display: inline-block;
    border-radius: 5px;
    margin-right: 10px;
    margin-bottom: 10px;
    background-color: #ccc;

    :deep(.el-button.disabled) {
      color: grey;
    }

    :deep(.el-button.btn-delete) {
      padding: 2px;
      border: 0;
      min-height: 10px;
    }

    .image-item {
      position: relative;
      border: 1px solid #dcdfe6;
      border-radius: 4px;

      .btn-image-download {
        color: white;
      }

      :deep(.c-image) {
        width: $image-size;
        height: $image-size;

        .el-image {
          width: $image-size;
          height: $image-size;
          cursor: pointer;
        }
      }

      &:hover {
        .action-mask {
          visibility: visible;
        }
      }

      .action-mask {
        position: absolute;
        top: 0;
        height: 100%;
        width: 100%;
        visibility: hidden;
        font-size: 18px;
        cursor: pointer;
        background: rgba($color: #000000, $alpha: 0.3);
        color: white;
      }
    }

    .text-item {
      padding: 0 10px;
    }

    .btn-delete {
      position: absolute;
      top: -5px;
      right: -5px;
      padding: 0;
      width: 18px;
      height: 18px;
    }
  }
}

.no-data {
  padding: 10px;

  &.no-padding {
    padding: 0;
    display: inline-block;
  }
}

.file-list-item-btn {
  color: #3693ff;
  cursor: pointer;
  font-weight: 700;
}
</style>

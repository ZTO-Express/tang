<template>
  <div class="c-file-list">
    <slot v-if="!fileItems || !fileItems.length" name="empty">
      <div class="no-data" :class="{ 'no-padding': noPadding }">
        <slot name="no-data">暂无文件</slot>
      </div>
    </slot>
    <div v-else class="file-items">
      <template v-for="(it, index) in fileItems">
        <slot name="item" v-bind="{ _index: index, ...it }">
          <div :key="index" class="file-item" :title="it.name">
            <el-button v-if="downloadable" type="text" @click="handleLink(it)">
              <div class="label text-ellipsis" :style="{ maxWidth: maxItemWidth }">
                {{ it.label || it.name }}
              </div>
            </el-button>
            <el-button
              v-else
              class="label text-ellipsis disabled"
              type="text"
              :style="{ maxWidth: maxItemWidth }"
            >
              {{ it.label || it.name }}
            </el-button>
            <el-button
              v-if="!readonly"
              class="btn-delete"
              type="info"
              circle
              icon="el-icon-close"
              @click="handleDelete(index)"
            />
          </div>
        </slot>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { fileUtil } from '@zto/zpage'
import { Close } from '@element-plus/icons'

interface FileListItem {
  name: string
  url: string
  label?: string
  fileSource?: number
}

const props = withDefaults(
  defineProps<{
    modelValue?: Array<any>
    readonly?: boolean
    downloadable?: boolean
    noPadding?: boolean
    withoutPostfix?: boolean
    maxItemWidth?: string
    downloadMethod?: GenericFunction
    immediateDelete?: boolean // 删除操作时，直接删除指定项
    params?: string // 额外的参数
  }>(),
  {
    maxItemWidth: '200px',
    immediateDelete: false
  }
)

const emit = defineEmits(['update:modelValue', 'delete', 'deleted'])

const fileItems = ref<FileListItem[]>([])

watch(
  () => props.modelValue,
  () => {
    resetFileItems()
  },
  {
    immediate: true
  }
)

function handleDelete(index: number) {
  let item = fileItems.value[index]

  if (item) {
    if (props.immediateDelete) {
      deleteItem(item)
    }

    emit('delete', item, index, props.params)
  }
}

function handleLink(it: FileListItem) {
  innerDownloadMethod(it)
}

function innerDownloadMethod(it: FileListItem) {
  const options = {
    fname: it.name,
    withoutPostfix: props.withoutPostfix
  }

  if (props.downloadMethod) {
    props.downloadMethod(it, options)
  } else {
    fileUtil.download(it.url, options)
  }
}

function deleteItem(item: FileListItem | number) {
  let index: any = undefined

  const items = fileItems.value

  if (typeof item === 'number') {
    index = item
    item = items[index]
  } else {
    index = items.indexOf(item)
  }

  if (item && index >= 0) {
    items.splice(index, 1)
    emit('deleted', item)
    emit('update:modelValue', items)
  }
}

function resetFileItems() {
  if (!props.modelValue?.length) {
    fileItems.value = []
    return
  }

  fileItems.value = props.modelValue
    .filter(it => !!it)
    .map((it: any) => {
      const id = it.id
      const url = it.url
      const fileSource = it.fileSource || 0

      let name = it.name
      if (!name && it.url) {
        const { fname } = fileUtil.parseFileName(it.url)
        name = fname
      }

      return {
        name,
        url,
        id,
        fileSource
      }
    })
}
</script>

<style lang="scss" scoped>
.c-file-list {
  display: inline-block;
  border-radius: 3px;

  .file-items {
    padding: 5px;
  }

  .file-item {
    display: inline-block;
    padding: 0 10px;
    border-radius: 5px;
    margin-right: 5px;
    margin-bottom: 5px;
    background-color: #ccc;

    :deep(.el-button.disabled) {
      color: grey;
    }

    :deep(.el-button.btn-delete) {
      padding: 2px;
      border: 0;
      min-height: 10px;
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
</style>

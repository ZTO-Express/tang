<template>
  <div v-if="data && updateState.uploadFile" class="c-upload-item-wrap" :class="{ error: !!updateState.errorMsg }">
    <div class="c-upload-item">
      <div class="head">
        <div v-if="data.fsizeExceeded" class="error fh flex-center">
          <Warning color="danger" />
        </div>
        <div v-else-if="data.loading" v-loading class="loading fh flex-center">&nbsp;</div>
        <div
          v-else-if="updateState.thumbnailUrl"
          class="thumb"
          :style="{ backgroundImage: `url(${updateState.thumbnailUrl})` }"
        />
        <div v-else-if="isAudio" class="audio fh flex-center">
          <Ticket color="primary" size="24" />
        </div>
        <div v-else-if="isVideo" class="video fh flex-center">
          <Camera color="primary" size="24" />
        </div>
      </div>
      <div class="body">
        <div
          class="name text-ellipsis"
          :title="updateState.fileName"
          :style="{ maxWidth: updateState.errorMsg ? '200px' : '350px' }"
        >
          {{ updateState.fileName }}
        </div>
        <div class="progress">
          <span>{{ updateState.fileSize }}</span>
          <span>/</span>
          <span>{{ updateState.uploadProgress }}%</span>
        </div>
      </div>
      <div class="tail">
        <div v-if="updateState.errorMsg" class="error-message">
          <div class="message text-ellipsis" :title="updateState.errorMsg">{{ updateState.errorMsg }}</div>
          <el-button type="info" plain class="btn-action q-ml-sm" circle v-preventReclick @click="handleRemove">
            <Minus :size="15" color="grey" />
          </el-button>
        </div>
        <el-button v-else-if="updateState.uploadCompleted" type="text" class="btn-action" circle v-preventReclick>
          <Check :size="15" color="green" />
        </el-button>
        <el-button v-else-if="!noCancel" type="text" class="btn-action" circle v-preventReclick @click="handleCancel">
          <Close :size="15" />
        </el-button>
      </div>
    </div>

    <div class="progress-mask" :style="{ width: `${updateState.uploadProgress}%` }"></div>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { fileUtil, reactive, computed, watch, ref } from '@zto/zpage'
import { Warning, Ticket, Camera, Minus, Check, Close } from '@element-plus/icons'

import type { UploadData } from './types'

const props = withDefaults(
  defineProps<{
    data?: UploadData
    noCancel?: boolean
  }>(),
  {}
)

const emit = defineEmits(['cancel', 'remove'])

const updateState = reactive<{
  uploadFile: File | undefined
  fileName: string
  fileSize: number
  uploadProgress: number
  uploadCompleted: boolean
  thumbnailUrl: string
  errorMsg: string
}>({
  uploadFile: undefined,
  fileName: '',
  fileSize: 0,
  uploadProgress: 0,
  uploadCompleted: false,
  thumbnailUrl: '',
  errorMsg: ''
})

const mimeType = computed(() => {
  if (!updateState.uploadFile) return ''
  return updateState.uploadFile.type || ''
})

const isAudio = computed(() => {
  return mimeType.value.indexOf('audio/') === 0
})

const isVideo = computed(() => {
  return mimeType.value.indexOf('video/') === 0
})

watch(
  () => props.data,
  () => {
    reloadData()
  },
  {
    immediate: true
  }
)

function handleCancel() {
  if (props.data?.completed) return
  emit('cancel', props.data)
}

function handleRemove() {
  emit('remove', props.data)
}

function reloadData() {
  reset()

  const data = props.data
  if (!data?.file) return

  updateState.uploadFile = data?.file

  updateState.fileName = updateState.uploadFile.name
  updateState.fileSize = fileUtil.size(updateState.uploadFile.size) as number
  updateState.uploadProgress = data.progress || 0
  updateState.uploadCompleted = data.completed || false
  updateState.thumbnailUrl = data.thumbnail || ''
  updateState.errorMsg = data.errorMsg || ''
}

function reset() {
  updateState.uploadFile = undefined
  updateState.fileName = ''
  updateState.uploadProgress = 0
  updateState.uploadCompleted = false
  updateState.thumbnailUrl = ''
  updateState.errorMsg = ''
}
</script>

<style lang="scss" scoped>
.c-upload-item {
  &-wrap {
    position: relative;
    height: 44px;
    background: #f7f7f7;
  }

  box-sizing: border-box;
  display: flex;
  padding: 4px 8px;
  border-radius: 3px;
  border: 1px solid #d9d9d9;
  position: absolute;
  z-index: 1;
  width: 100%;
  left: 0;
  top: 0;
  height: 100%;

  & > .head {
    i {
      font-size: 24px;
    }

    & > .thumb {
      width: 50px;
      height: 100%;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    }
  }

  & > .body {
    flex: 1;
    padding-left: 10px;
    & > .name {
      font-weight: bold;
      font-size: 14px;
      line-height: 18px;
    }

    & > .progress {
      font-size: 12px;
      line-height: 18px;
    }
  }

  & > .tail {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0;

    .btn-action {
      width: 28px;
      height: 28px;
      padding: 2px;
      margin: 3px;
    }

    .error-message {
      display: flex;
      align-items: center;
      color: #777;

      .message {
        flex: 1;
        max-width: 160px;
      }

      .btn-action {
        color: #777;
      }
    }
  }

  &-wrap {
    .progress-mask {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      z-index: 0;
      background: #19be6b;
      opacity: 0.2;
    }

    &.error .progress-mask {
      background: #ed4014;
      width: 100% !important;
    }
  }
}
</style>

<style lang="scss">
.c-upload-item {
  .z-spinner-inner .path {
    stroke: var(--primary);
  }
}
</style>

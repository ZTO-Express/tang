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
        :list-type="listType"
        @delete="handleFileDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { vue } from '@zto/zpage'

const { ref, watch, reactive, computed } = vue

const props = withDefaults(
  defineProps<{
    modelValue?: Array<any> | any
    multiple?: boolean
    countLimit?: number
    sizeLimit?: number
    accept?: string
    listType?: string
    openFile?: boolean
    closeWhenCompleted?: boolean
    autoUpload?: boolean
    tip?: boolean | string | Record<string, any>
    uploadAttrs?: Record<string, any>
    listAttrs?: Record<string, any>
    disabled?: boolean
  }>(),
  {
    multiple: true,
    countLimit: 10,
    openFile: true,
    closeWhenCompleted: true,
    autoUpload: false,
    disabled: false
  }
)

const emit = defineEmits(['update:modelValue', 'delete', 'deleted'])

const uploadState = reactive<{
  fileList: any[]
}>({
  fileList: []
})

const innerCountLimit = computed(() => {
  return props.countLimit - uploadState.fileList.length
})

const isDisabled = computed(() => {
  return props.disabled || innerCountLimit.value <= 0
})

watch(
  () => props.modelValue,
  () => {
    uploadState.fileList = props.modelValue || []

    if (props.modelValue && !Array.isArray(props.modelValue)) {
      uploadState.fileList = [props.modelValue]
    }
  },
  {
    immediate: true
  }
)

watch(
  () => uploadState.fileList,
  () => {
    const val = props.multiple ? uploadState.fileList : uploadState.fileList[0]
    emit('update:modelValue', val)
  }
)

function handleUploadCompleted(e: any) {
  const fileList = uploadState.fileList || []
  fileList.push({
    name: e.fname,
    path: e.fullpath,
    url: e.url
  })

  uploadState.fileList = [...fileList]
}

function handleFileDelete(item: any, index: number) {
  const fileList = uploadState.fileList || []
  fileList.splice(index, 1)

  uploadState.fileList = [...fileList]
}
</script>

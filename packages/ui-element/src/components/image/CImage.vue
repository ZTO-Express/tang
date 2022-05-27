<template>
  <div class="c-image">
    <el-button v-if="label" type="text" @click="handleLabelClick" :disabled="!innerSrcs.length">
      <template v-if="innerSrcs?.length">
        <span>{{ label }}</span>
        <span v-if="showCount && innerSrcs?.length">({{ innerSrcs?.length }})</span>
      </template>
      <template v-else>
        <span>{{ emptyText || label }}</span>
      </template>
    </el-button>
    <el-image
      v-else-if="innerUrl"
      :class="{ 'is-preview': preview }"
      v-bind="$attrs"
      :src="innerUrl"
      :fit="fit"
      @click="handleLabelClick"
    >
      <template #error>
        <div class="error flex-center">
          <el-button v-if="srcType === 'path'" class="error-button" type="text" @click="handleReload">
            重新加载
          </el-button>
          <div v-else class="error-label">加载失败</div>
        </div>
      </template>
    </el-image>
    <div v-else class="empty flex-center" v-bind="$attrs">{{ emptyText }}</div>
    <el-image-viewer
      v-if="showPreview"
      :url-list="innerUrls"
      :initial-index="initialIndex"
      :hide-on-click-modal="hideOnClickModal"
      @close="handlePreviewClose"
    ></el-image-viewer>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted, useCurrentAppInstance } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    src?: string | string[]
    srcType?: 'path' | 'url' // path: 需要请求url才能显示，url: 直接显示
    label?: string
    emptyText?: string
    showCount?: boolean // 是否显示图片张数（label不为true有效）
    fit?: string
    preview?: boolean
    initialIndex?: number
    hideOnClickModal?: boolean
  }>(),
  {
    emptyText: '暂无图片',
    srcType: 'path',
    fit: 'contain',
    initialIndex: 0,
    preview: true,
    hideOnClickModal: true
  }
)

const app = useCurrentAppInstance()

const { fsApi } = app.apis

const innerUrls = ref<string[]>([])
const showPreview = ref<boolean>(false)

const innerSrcs = computed(() => {
  if (!props.src) return []
  if (typeof props.src === 'string') {
    return props.src.split(',')
  }
  return props.src || []
})

const innerUrl = computed(() => {
  return innerUrls.value && innerUrls.value[props.initialIndex]
})

// 显示图片(显示本身图片或预览图)
const showImage = computed(() => {
  return !props.label || !!showPreview.value
})

watch(
  () => [showPreview.value, innerSrcs.value, props.srcType],
  async () => {
    await loadImageUrls()
  }
)

onMounted(async () => {
  await loadImageUrls()
})

function handleLabelClick() {
  if (props.preview === false) return
  showPreview.value = true
}

function handleReload() {
  loadImageUrls()
}

function handlePreviewClose() {
  showPreview.value = false
}

// 根据文件名获取文件url
async function loadImageUrls() {
  // 只有要显示图片时才正式加载
  if (!showImage.value) return

  if (props.srcType === 'url') {
    innerUrls.value = innerSrcs.value
  } else {
    if (!innerSrcs.value?.length) return []
    const urls = await fsApi.getFileUrls!(innerSrcs.value)
    innerUrls.value = urls
  }
}
</script>

<style lang="scss" scoped>
.c-image {
  max-height: 100%;
  max-width: 100%;
}

.is-preview {
  cursor: pointer;
}

.error {
  background: #f5f7fa;
  color: var(--el-text-color-placeholder);
  height: 100%;

  .error-button {
    opacity: 0.8;
  }
}
.empty {
  background: #f5f7fa;
  color: var(--el-text-color-placeholder);
  height: 100%;
}
</style>

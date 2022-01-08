<template>
  <div class="c-image">
    <el-button v-if="label" type="text" @click="handleLabelClick" :disabled="!innerSrcs.length">
      <span>{{ label }}</span>
      <span v-if="showCount && innerSrcs?.length">({{ innerSrcs?.length }})</span>
    </el-button>
    <el-image v-else v-bind="$attrs" :src="innerUrl" :fit="fit" @click="handleLabelClick">
      <template #error>
        <div class="load-error-con flex-center">
          <el-button v-if="srcType === 'path'" class="error-button" type="text" @click="handleReload">
            重新加载
          </el-button>
          <div v-else class="error-label">加载失败</div>
        </div>
      </template>
    </el-image>
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
import { vue, fileUtil } from '@zto/zpage'

const { ref, computed, watch, onMounted } = vue

const props = withDefaults(
  defineProps<{
    label?: String
    showCount?: boolean // 是否显示图片张数（label不为true有效）
    srcType?: 'path' | 'url' // path: 需要请求url才能显示，url: 直接显示
    src?: string | string[]
    fit?: string
    preview?: boolean
    initialIndex?: number
    hideOnClickModal?: boolean
  }>(),
  {
    srcType: 'path',
    fit: 'contain',
    initialIndex: 0,
    hideOnClickModal: true
  }
)

const innerUrls = ref<string[]>([])
const showPreview = ref<boolean>(false)

const innerSrcs = computed(() => {
  if (!props.src) return []
  if (typeof props.src === 'string') return [props.src]
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
    const urls = await fileUtil.getUrlsByPaths(innerSrcs.value)
    innerUrls.value = urls
  }
}
</script>

<style lang="scss" scoped>
.c-image {
  max-height: 100%;
  max-width: 100%;
}

.load-error-con {
  background: #f5f7fa;
  color: var(--el-text-color-placeholder);
  height: 100%;

  .error-button {
    opacity: 0.8;
  }
}
</style>

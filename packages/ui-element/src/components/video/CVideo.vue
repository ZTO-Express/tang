<template>
  <div class="c-video">
    <el-button v-if="label" type="text" @click="handleLabelClick" :disabled="!innerUrl">
      <span>{{ label }}</span>
    </el-button>
    <video
      v-else-if="innerUrl"
      class="c-video__inner"
      v-bind="$attrs"
      :src="innerUrl"
      @click="handleLabelClick"
    ></video>
    <div v-else class="empty flex-center" v-bind="$attrs">暂无视频</div>

    <c-dialog v-if="innerUrl" ref="dialogRef" title="视频预览" no-submit no-padding>
      <video class="dialog-video" controls autoplay v-bind="$attrs" :src="innerUrl"></video>
    </c-dialog>
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
    src: string
    label?: String
    srcType?: 'path' | 'url' // path: 需要请求url才能显示，url: 直接显示
  }>(),
  {
    srcType: 'path'
  }
)

const dialogRef = ref<any>()

const innerUrl = ref<string>('')

// 显示图片(显示本身图片或预览图)
const showVideo = computed(() => {
  return !props.label
})

watch(
  () => [props.src, props.srcType],
  async () => {
    await loadVideoUrl()
  }
)

onMounted(async () => {
  await loadVideoUrl()
})

function handleLabelClick() {
  if (!dialogRef.value) return

  dialogRef.value.show()
}

// 根据文件名获取文件url
async function loadVideoUrl() {
  // 只有要显示图片时才正式加载
  if (!showVideo.value || !props.src) return

  if (props.srcType === 'url') {
    innerUrl.value = props.src
  } else {
    const urls = await fileUtil.getFileUrls([props.src])
    innerUrl.value = urls[0]
  }
}
</script>

<style lang="scss" scoped>
.c-video__inner {
  max-height: 100%;
  max-width: 100%;
  cursor: pointer;
}

.empty {
  background: #f5f7fa;
  color: var(--el-text-color-placeholder);
  height: 100%;
}

.dialog-video {
  max-height: 50vh;
}
</style>

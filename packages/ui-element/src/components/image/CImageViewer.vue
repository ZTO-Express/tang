<template>
  <div class="c-image-viewer">
    <slot />

    <el-image-viewer
      v-if="isShowPreview"
      :url-list="displayUrls"
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
import { ref, reactive, provide, toRefs, computed, watch, onMounted, useCurrentAppInstance } from '@zto/zpage'
import { C_IMAGE_VIEWER_KEY } from './image'

import type { ImageContext, ImageDisplayInfo } from './image'

const props = withDefaults(
  defineProps<{
    hideOnClickModal?: boolean
  }>(),
  {
    hideOnClickModal: false
  }
)

const app = useCurrentAppInstance()

const { fsApi } = app.apis

const images: ImageContext[] = [] // 图片列表
const initialIndex = ref<number>(0) // 初始显示位置
const isShowPreview = ref<boolean>(false) // 显示预览图片
const displayInfos = ref<ImageDisplayInfo[]>([]) // 图片显示信息

/** 需要显示的图片 */
const displayImages = computed(() => {
  // return images.filter(it => it.preview && !it.innerSrcs?.length)
  return images
})

const displayUrls = computed(() => {
  const urls = (displayInfos.value || []).map(it => it.url)
  return urls
})

provide(C_IMAGE_VIEWER_KEY, reactive({ ...toRefs(props), show, addImage, removeImage }))

/** 关闭预览 */
function handlePreviewClose() {
  isShowPreview.value = false
}

/** 新增图片组件 */
function addImage(img: ImageContext) {
  images.push(img)
}

/** 移除图片组件 */
function removeImage(img: ImageContext) {
  images.splice(images.indexOf(img), 1)
}

/** 显示预览 */
async function show(img: ImageContext) {
  const imgIndex = displayImages.value.indexOf(img)
  if (imgIndex < 0) return

  initialIndex.value = imgIndex
  isShowPreview.value = true

  await loadDisplayInfos()
}

// 获取当前注册图片显示信息
async function loadDisplayInfos() {
  // 初步设置显示信息
  const infos: ImageDisplayInfo[] = displayImages.value.map(it => {
    // 支持预览并且存在内部路径
    const src = it.innerSrcs[0]
    const srcType = it.srcType || 'path'
    const url = srcType === 'path' ? it.innerUrl : src

    return { srcType, src, label: it.label, url }
  })

  // 获取path类型地址
  if (fsApi.getFileUrls) {
    const pathSrcs = infos.filter(it => it.src && it.srcType === 'path').map(it => it.src)
    const pathUrls: string[] = await fsApi.getFileUrls(pathSrcs)

    const srcUrls = pathSrcs.reduce((col, cur, index) => {
      if (cur) col[cur] = pathUrls[index]
      return col
    }, {} as Record<string, string>)

    infos.forEach(it => {
      if (it.src && it.srcType === 'path') it.url = srcUrls[it.src]
    })
  }

  displayInfos.value = infos
}
</script>

<style lang="scss" scoped>
.c-image-viewer {
}
</style>

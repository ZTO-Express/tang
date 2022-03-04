<template>
  <div v-if="isShow" class="c-file-viewer">
    <van-popup
      v-if="isOffice"
      :model-value="true"
      class="fh"
      closeable
      position="bottom"
      :z-index="zIndex"
      @click="handleClose"
    >
      <div class="frame-con" @click.stop="handleClose">
        <iframe :src="files[0]" width="100%" height="100%"></iframe>
      </div>
    </van-popup>
    <van-image-preview v-else :model-value="true" :images="files" :closeable="true" @close="handleClose">
    </van-image-preview>
  </div>
</template>

<script lang="ts" setup>
import { vue } from '@zto/zpage'
const { ref } = vue

const props = withDefaults(
  defineProps<{
    files: any[]
    srcType?: string // path/url
    isOffice?: boolean
    zIndex?: number
  }>(),
  {
    srcType: 'path',
    isOffice: false,
    zIndex: 999
  }
)

const isShow = ref<boolean>(false)

function open() {
  isShow.value = true
}

function handleClose() {
  isShow.value = false
}
</script>

<style scoped lang="scss">
.c-file-viewer {
  .frame-con {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
}
</style>

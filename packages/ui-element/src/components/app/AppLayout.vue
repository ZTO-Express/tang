<template>
  <el-container
    class="c-app fs"
    :class="{ 'no-frame': !isShowFrame, 'no-nav': !isShowNav, 'no-header': !isShowHeader }"
    direction="vertical"
  >
    <template v-if="isShowFrame">
      <el-header v-if="isShowHeader" class="app-header-con">
        <app-header />
      </el-header>
      <app-container class="app-container" />
    </template>
    <template v-else>
      <app-content />
    </template>
  </el-container>
</template>

<script setup lang="ts">
import { _, ref, computed, useCurrentAppInstance, onMounted, onUnmounted } from '@zto/zpage'

import AppHeader from './app-header.vue'
import AppContent from './app-content.vue'
import AppContainer from './app-container.vue'

import Watermark from '../../utils/watermark'

const app = useCurrentAppInstance()

const frameConfig = app.useAppConfig('frame')
const menuConfig = app.useAppConfig('menu', {})

/** 是否显示框架 */
const isShowFrame = computed(() => {
  if (app.isMicro && _.isNil(frameConfig)) return false

  return frameConfig !== false
})

/** 是否显示头部 */
const isShowHeader = computed(() => {
  if (frameConfig?.header === false) return false
  if (!isShowFrame.value) return false

  return true
})

/** 是否显示菜单 */
const isShowNav = computed(() => {
  return isShowFrame.value && !!menuConfig.showNav
})

// 水印相关
const { userStore } = app.stores
const watermark = ref<any>(null)
const watermarkContent = computed(() => {
  const { nickname, mobile } = userStore.data?.basic || {}
  return `${nickname}\n${mobile}`
})

onMounted(() => {
  // 调用
  watermark.value = new Watermark({
    content: watermarkContent.value
  })
})

onUnmounted(() => {
  watermark.value.unload()
})
</script>

<style lang="scss" scoped>
.c-app {
  background: var(--app-bg-color);
}

.app-header-con {
  padding: 0;
  height: var(--app-header-height);
}

.app-container {
  height: calc(100% - var(--app-header-height));
}

.c-app {
  &.noheader .app-container {
    height: 100%;
  }

  &.no-nav {
    .app-main-con {
      height: calc(100% - 20px);
    }
  }
}
</style>

<style lang="scss">
.c-app.no-frame > .c-page {
  min-width: 100%;
  margin: 0;
}
</style>

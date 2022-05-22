<template>
  <el-container class="c-app fs" :class="{ 'no-frame': !showFrame, 'no-nav': !showNav }" direction="vertical">
    <template v-if="showFrame">
      <el-header class="app-header-con">
        <app-header />
      </el-header>
      <app-container v-show="!isSubmoduleMicro" class="app-container" />
      <app-micro-container v-show="isSubmoduleMicro" class="app-container" />
    </template>
    <template v-else>
      <app-content />
    </template>
  </el-container>
</template>

<script setup lang="ts">
import { computed, useCurrentAppInstance } from '@zto/zpage'

import AppHeader from './app-header.vue'
import AppContent from './app-content.vue'
import AppContainer from './app-container.vue'
import AppMicroContainer from './app-micro-container.vue'

const app = useCurrentAppInstance()

const frameConfig = app.useAppConfig('frame')
const menuConfig = app.useAppConfig('menu', {})

const route = app.useRoute()

/** 是否显示框架 */
const showFrame = computed(() => {
  return frameConfig !== false
})

/** 是否显示菜单 */
const showNav = computed(() => {
  return showFrame.value && !!menuConfig.showNav
})

/** 是否子系统为微前端 */
const isSubmoduleMicro = computed(() => {
  return route.meta?.isMicro && route.meta?.isSubmodule
})
</script>

<style lang="scss" scoped>
.c-app {
  background: $app-bg-color;

  &.no-nav {
    .app-main-con {
      height: calc(100% - 20px);
    }
  }
}

.app-header-con {
  padding: 0;
  height: $app-header-height;
}

.app-container {
  height: calc(100vh - $app-header-height);
}
</style>

<style lang="scss">
.c-app.no-frame > .c-page {
  min-width: 100%;
  margin: 0;
}
</style>

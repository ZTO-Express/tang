<template>
  <el-container class="app-container">
    <el-aside class="app-aside" :class="{ collapse: asideCollapse }">
      <el-scrollbar max-height="calc(100% - 40px)">
        <transition name="fade" mode="out-in">
          <app-menu :collapse="asideCollapse" />
        </transition>
      </el-scrollbar>
      <div class="app-aside__footer flex-center">
        <el-icon @click="handleAsideCollapse">
          <back v-if="asideCollapse" color="white" />
          <back v-else color="white" />
        </el-icon>
      </div>
    </el-aside>
    <div class="app-body fs">
      <div v-if="showNav" class="app-nav-con">
        <app-nav />
      </div>
      <div class="app-main-con no-padding">
        <app-content />
      </div>
    </div>
  </el-container>
</template>

<script setup lang="ts">
import { vue, useConfig } from '@zto/zpage'
import { Back } from '@element-plus/icons'

import AppMenu from './app-menu.vue'
import AppNav from './app-nav.vue'
import AppContent from './app-content.vue'

const { computed, ref } = vue

const asideCollapse = ref(false)
const menuConfig = useConfig('app.menu', {})
const frameConfig = useConfig('app.frame')

/** 是否显示框架 */
const showFrame = computed(() => {
  return frameConfig !== false
})

/** 是否显示菜单 */
const showNav = computed(() => {
  return showFrame.value && !!menuConfig.showNav
})

function handleAsideCollapse() {
  asideCollapse.value = !asideCollapse.value
}
</script>

<style lang="scss" scoped>
.app-aside {
  position: relative;
  width: $app-sidebar-width;
  overflow-x: hidden;
  background: rgb(14, 21, 36);

  .app-aside__footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 40px;
    background: rgba(54, 147, 255, 0.1);

    :deep(i) {
      font-size: 18px;
      cursor: pointer;
    }

    :deep(.el-scrollbar__view) {
      height: 100%;
    }
  }

  &.collapse {
    width: 60px;
  }

  &.collapse .app-aside__footer {
    :deep(i) {
      transform: rotate(180deg);
    }
  }
}

.app-body {
  overflow: auto;

  .app-nav-con {
    height: $app-nav-height;
  }

  .app-main-con {
    height: calc(100% - $app-nav-height - 20px);
  }
}
</style>

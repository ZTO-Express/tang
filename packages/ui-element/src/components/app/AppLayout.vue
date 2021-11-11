<template>
  <el-container class="c-app fs">
    <el-header class="app-header-con">
      <app-header />
    </el-header>
    <el-container class="app-body-con">
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
      <div class="app-body fs" :class="{ 'no-nav': !showNav }">
        <div v-if="showNav" class="app-nav-con">
          <app-nav />
        </div>
        <div class="app-main-con no-padding">
          <router-view v-slot="{ Component }">
            <template v-if="Component">
              <transition mode="out-in">
                <keep-alive :include="cachedPageKeys">
                  <suspense>
                    <component :is="Component" />
                    <template #fallback>
                      <div>加载中...</div>
                    </template>
                  </suspense>
                </keep-alive>
              </transition>
            </template>
          </router-view>
        </div>
      </div>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore, useConfig } from 'zpage'
import { Back } from '@element-plus/icons'

import AppHeader from './app-header.vue'
import AppMenu from './app-menu.vue'
import AppNav from './app-nav.vue'

const store = useStore()

const asideCollapse = ref(false)
const menuConfig = useConfig('app.menu', {})

const showNav = menuConfig.showNav

const cachedPageKeys = computed(() => {
  const keys = store.getters.visitedPages.map((it: any) => it.key)
  return keys
})

function handleAsideCollapse() {
  asideCollapse.value = !asideCollapse.value
}
</script>

<style lang="scss" scoped>
.c-app {
  background: $app-bg-color;
}

.app-header-con {
  padding: 0;
  height: $app-header-height;
}

.app-body-con {
  height: calc(100vh - $app-header-height);
}

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

  &.no-nav {
    .app-main-con {
      height: calc(100% - 20px);
    }
  }
}
</style>

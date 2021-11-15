<template>
  <div class="app-header fw">
    <div class="header-logo" @click="handleLogoClick">
      <img :src="logo" />
      <!-- <div class="title">{{ title }}</div> -->
    </div>
    <div class="header-body">
      <div class="header-menu">
        <el-tabs v-model="activeTabName" class="header-menu-tabs" @tab-click="handleTabClick">
          <el-tab-pane v-for="it in tabItems" :key="it.name" :name="it.name">
            <template #label>
              <span>
                <i v-if="it.icon" :class="`el-${it.icon}`" />
                {{ it.label }}
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="header-extra">
        <div class="header-links">
          <el-dropdown class="link-item" size="medium" @command="handleDropdownCommand">
            <span class="dropdown-link">{{ nickname }}</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item class="dropdown-link__item" command="logout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { vue, useConfig, useAppRouter, useAppStore } from '@zpage/zpage'

const { computed, ref } = vue

const router = useAppRouter()
const store = useAppStore()

const config = useConfig('app')

const logo = config.assets.logo

const nickname = store.getters.nickname

const tabItems = computed(() => {
  return store.getters.submodules.map((it: any) => {
    return {
      name: it.name,
      label: it.title
    }
  })
})

// 当前激活按钮
const activeTabName = ref(store.getters.navMenu.submodule)

// 单击logo，返回首页
function handleLogoClick() {
  router.goHome()
}

// 菜单选中
function handleTabClick() {
  store.dispatch('app/changeSubmodule', { name: activeTabName.value })
}

// 下拉菜单命令
function handleDropdownCommand(command: string) {
  switch (command) {
    case 'logout':
      store.dispatch('user/logout')
      break
  }
}
</script>

<style lang="scss" scoped>
$app-header-padding: 5px;
$app-header-inner-height: ($app-header-height - $app-header-padding * 2);

.app-header {
  height: 100%;
  border-bottom: 1px solid $border-color;
  display: flex;
  color: hsla(0, 0%, 100%, 0.8);
  background: linear-gradient(315deg, #5430ff, #3693ff);
}

.header-logo {
  padding: $app-header-padding;
  padding-left: 20px;
  padding-right: 100px;
  cursor: pointer;

  & > img {
    height: $app-header-inner-height;
    float: left;
  }

  & > .title {
    display: inline-block;
    font-size: 18px;
    font-weight: 500;
    padding: 0 10px;
    line-height: $app-header-inner-height;
  }
}

.header-body {
  flex: 1;
  display: flex;
}

.header-menu {
  flex: 1;

  :deep(.el-tabs) {
    height: $app-header-height;

    .el-tabs {
      &__header {
        margin: 0;
        height: 100%;
      }

      &__nav {
        height: $app-header-height;
      }

      &__active-bar {
        background-color: white;
      }

      &__nav-wrap::after {
        background-color: transparent;
      }

      &__item {
        height: $app-header-height;
        line-height: $app-header-height;
        opacity: 0.5;
        color: white;

        &.is-active {
          opacity: 1;
        }

        &:hover {
          opacity: 1;
        }
      }
    }
  }
}

.header-extra {
  padding: 0 20px;
}

.header-links {
  line-height: $app-header-height;

  .link-item {
    display: inline-block;
    &.plain {
      cursor: default;
    }

    .dropdown-link {
      cursor: pointer;
      color: white;
    }
  }

  .link-item + .link-item {
    margin-left: 30px;
  }
}
</style>

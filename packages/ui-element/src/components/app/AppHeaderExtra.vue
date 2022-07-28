<template>
  <div class="app-header-extra">
    <div v-if="isDownloads" class="button-link icon" type="text" @click="handleDownloadsClick">
      <el-icon class="icon"><icon-list /></el-icon>
      <span class="label">下载列表</span>
    </div>

    <div class="divider">
      <el-divider direction="vertical"></el-divider>
    </div>

    <div class="dropdown-con">
      <el-dropdown class="link-item" size="medium" trigger="click" @command="handleDropdownCommand">
        <span class="dropdown-link">
          {{ nickname }}
          <el-icon class="dropdown-link__icon">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item class="dropdown-link__item" command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrentAppInstance, computed } from '@zto/zpage'
import { ArrowDown, List as IconList } from '@element-plus/icons'

import { appUtil } from '../../utils'

const app = useCurrentAppInstance()

const { userStore } = app.stores
const downloadsConfig = app?.useAppConfig('header.downloads')

const nickname = computed(() => userStore.nickname)

const isDownloads = computed(() => {
  return !!(downloadsConfig && downloadsConfig !== false)
})

// 下拉菜单命令
function handleDropdownCommand(command: string) {
  switch (command) {
    case 'logout':
      app.logout()
      break
  }
}

// 打开下载页
function handleDownloadsClick() {
  appUtil.openDownloadsDialog()
}
</script>

<style lang="scss">
.app-header-extra {
  display: flex;
  height: var(--app-header-height);
  padding-right: 20px;

  & > div {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button-link {
    position: relative;
    color: white;
    font-weight: normal;
    cursor: pointer;
    margin-right: 10px;

    &:hover {
      opacity: 0.8;
    }

    &.icon {
      padding-left: 15px;
    }

    & > .icon {
      position: absolute;
      left: 0;
    }
  }

  .link-item {
    display: inline-block;
    &.plain {
      cursor: default;
    }
  }

  .dropdown-con {
    margin-left: 10px;
  }

  .dropdown-link {
    cursor: pointer;
    color: white;
    position: relative;

    &:hover {
      opacity: 0.8;
    }

    &__icon {
      position: absolute;
      margin-left: 5px;
      margin-top: -2px;
    }
  }

  .link-item + .link-item {
    margin-left: 30px;
  }
}
</style>

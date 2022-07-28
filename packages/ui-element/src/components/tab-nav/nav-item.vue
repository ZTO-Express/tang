<template>
  <div
    class="tab-nav-item"
    :class="itemClass"
    @click="onTabClick(navItem, $event)"
    @mousedown="onTabMouseDown(navItem, $event)"
  >
    <div class="subitem">
      <span>{{ navItem.label || navItem.name }}</span>
      <el-icon v-if="navItem.closeable !== false" class="icon-close" @click="onTabRemove(navItem, $event)">
        <circle-close />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from '@zto/zpage'
import { CircleClose } from '@element-plus/icons'

import type { GenericFunction } from '@zto/zpage'

const props = defineProps<{
  navItem: Record<string, any>
  currentKey?: string
  onTabRemove: GenericFunction
  onTabClick: GenericFunction
  onTabMouseDown: GenericFunction
}>()

const itemClass = computed(() => {
  const { currentKey, navItem } = props
  const active = navItem.key === currentKey

  return {
    active,
    closeable: navItem.meta?.closeable
  }
})
</script>

<style lang="scss" scoped>
.tab-nav-item {
  position: relative;
  cursor: pointer;
  height: 32px;
  padding: 6px 0 6px;
  line-height: 20px;
  color: var(--secondary);
  border: none;
  display: inline-block;
  box-sizing: border-box;

  .icon-close {
    font-size: 16px;
    color: var(--info);
    cursor: pointer;
    margin-left: 8px;
  }

  .subitem {
    padding: 0 16px;
    border-left: 1px solid var(--border-color);
  }

  &:first-child .subitem {
    border-left: 1px solid transparent;
  }

  &:hover {
    background: rgba(238, 240, 246, 1);
    border-radius: 4px 4px 0px 0px;
    opacity: 0.3;

    .subitem {
      border-left: 1px solid transparent;
    }

    & + .tab-nav-item .subitem {
      border-left: 1px solid transparent;
    }
  }

  &.active {
    color: var(--primary);
    background: var(--app-bg-color);
    border-radius: 4px 4px 0px 0px;
    opacity: 1;

    .subitem {
      border-left: 1px solid transparent;
    }

    & + .tab-nav-item .subitem {
      border-left: 1px solid transparent;
    }

    .icon-close {
      color: var(--primary);
    }

    &:before,
    &:after {
      position: absolute;
      z-index: 99;
      content: '';
      width: 10px;
      height: 10px;
      background-image: url('../../assets/nav/tab.png');
      background-size: 100%;
      bottom: 0;
    }

    &:before {
      left: -10px;
    }

    &:after {
      right: -10px;
      transform: rotate(90deg);
    }
  }
}
</style>

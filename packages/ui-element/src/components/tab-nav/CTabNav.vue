<template>
  <div ref="navRef" class="c-tab-nav" :class="{ scrollable }">
    <template v-if="scrollable">
      <nav-button
        :current-offset="currentOffset"
        :scrollable="scrollable"
        :set-offset="setOffset"
        :nav-width="navWidth"
        :container-width="containerWidth"
      />
    </template>
    <div ref="navScrollRef" class="nav-scroll">
      <div v-if="items.length" ref="navWrapperRef" class="nav-wrapper" :style="{ transform }">
        <nav-item
          v-for="item in items"
          :key="item.key"
          :nav-item="item"
          :current-key="currentKey"
          :on-tab-click="onTabClick"
          :on-tab-remove="onTabRemove"
          :on-tab-mouse-down="onTabMouseDown"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { vue, renderHtml } from '@zpage/zpage'
import { addResizeListener, removeResizeListener } from '../../utils/resize-event/resize-event'

import NavButton from './nav-button.vue'
import NavItem from './nav-item.vue'

const { computed, onMounted, onUnmounted, onUpdated, ref } = vue

const props = defineProps<{
  items: Array<Record<string, any>>
  currentKey: string
  onTabClick: GenericFunction
  onTabRemove: GenericFunction
  onTabMouseDown: GenericFunction
}>()

const navRef = ref<any>()
const navScrollRef = ref<any>()
const navWrapperRef = ref<any>()

const scrollable = ref<any>(null)
const transform = ref<string>('')
const navWidth = ref<number>(0)
const containerWidth = ref<number>(0)
const currentOffset = ref<number>(0)

const el = computed<any>(() => {
  return navRef.value
})

onMounted(() => {
  addResizeListener(el.value, update)
})

onUnmounted(() => {
  if (el.value) removeResizeListener(el.value, update)
})

onUpdated(() => {
  update()
})

function setPageData() {
  containerWidth.value = navScrollRef.value.offsetWidth
  navWidth.value = navWrapperRef.value?.offsetWidth || 0
  currentOffset.value = 0

  if (transform.value) {
    const match = transform.value.match(/translateX\(-(\d+(\.\d+)*)px\)/)
    match && (currentOffset.value = Number(match[1]))
  }
}

// 设置移动
function setOffset(value: number) {
  transform.value = `translateX(-${value}px)`
  setPageData()
}

function update() {
  setPageData()
  if (containerWidth.value < navWidth.value) {
    scrollable.value = scrollable.value || {
      prev: Boolean(currentOffset),
      next: Boolean(currentOffset.value + containerWidth.value < navWidth.value)
    }
    if (navWidth.value - currentOffset.value < containerWidth.value) {
      setOffset(navWidth.value - containerWidth.value)
    }
  } else {
    scrollable.value = null
    if (currentOffset.value > 0) {
      setOffset(0)
    }
  }
}

// 移动到当前tab
function scrollToActiveTab() {
  const activeTab = el.value.querySelector('.active')
  if (!scrollable.value || !activeTab) return
  const activeTabBounding = activeTab.getBoundingClientRect()
  const navScrollBounding = navScrollRef.value.getBoundingClientRect()
  const navBounding = navWrapperRef.value.getBoundingClientRect()
  let newOffset = currentOffset.value

  if (activeTabBounding.left < navScrollBounding.left) {
    newOffset = currentOffset.value - (navScrollBounding.left - activeTabBounding.left)
  }
  if (activeTabBounding.right > navScrollBounding.right) {
    newOffset = currentOffset.value + activeTabBounding.right - navScrollBounding.right
  }
  if (navBounding.right < navScrollBounding.right) {
    newOffset = navWrapperRef.value.offsetWidth - navScrollBounding.width
  }
  setOffset(Math.max(newOffset, 0))
}

defineExpose({
  scrollToActiveTab
})
</script>

<style lang="scss" scoped>
.c-tab-nav {
  margin-bottom: -1px;
  position: relative;
  overflow: hidden;

  &.scrollable {
    padding: 0 38px;
  }
}

.nav-scroll {
  overflow: hidden;

  & > .nav-wrapper {
    position: relative;
    z-index: 2;
    float: left;
    border: none;
    padding: 0 16px;
    white-space: nowrap;
    border-radius: 4px 4px 0 0;
    box-sizing: border-box;
    transition: transform 0.3s;
  }
}
</style>

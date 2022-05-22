<template>
  <div class="app-nav" @contextmenu="handleContextmenu">
    <div class="app-nav__header">
      <c-tab-nav
        :items="navItems"
        :current-key="currentKey"
        :on-tab-remove="handleTabRemove"
        :on-tab-click="handleTabClick"
        :on-tab-mouse-down="handleTabMouseDown"
      />
    </div>
    <div
      class="app-nav__popover"
      :style="{
        display: popoverState.isShow ? 'block' : 'none',
        left: popoverState.left,
        top: popoverState.top
      }"
    >
      <ul class="app-nav__actions">
        <li class="action-item" @click="handleCloseOthers">关闭其它标签</li>
        <li class="action-item" @click="handleCloseAll">关闭全部标签</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrentAppInstance, RUNTIME_GLOBAL_EVENTS, computed, onMounted, reactive, ref, watch } from '@zto/zpage'

const app = useCurrentAppInstance()

const emitter = app.emitter
const { pagesStore } = app.stores
const router = app.router
const route = app.useRoute()

const contextTab = ref<any>()

// 弹出框位置
const popoverState = reactive({
  isShow: false,
  left: '0px',
  top: '0px'
})

const navItems = computed(() => {
  return pagesStore.navPages
})

const currentKey = computed(() => {
  return pagesStore.current
})

watch(
  () => route.meta?.pageKey,
  async () => {
    await pagesStore.addCurrentVisited({ route })
  },
  { immediate: true }
)

onMounted(() => {
  // 点击页面任何地方，隐藏
  document.addEventListener('click', () => {
    popoverState.isShow = false
  })

  emitter.on(RUNTIME_GLOBAL_EVENTS.CLOSE_APP_NAV, () => {})
})

function handleTabClick(tab: any) {
  contextTab.value = tab

  if (tab.key !== currentKey.value) {
    router.push({ name: tab.name, query: tab.query })
  }
}

// 点击tab
function handleTabMouseDown(tab: any, event: MouseEvent) {
  if (event.button === 2) {
    contextTab.value = tab
    popoverState.left = `${event.clientX + 10}px`
    popoverState.top = `${event.clientY}px`
    popoverState.isShow = true
  }
}

// 右键菜单
function handleContextmenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
}

// 关闭其他标签
async function handleCloseOthers() {
  if (!contextTab.value) return

  await pagesStore.removeVisitedOthers(contextTab.value)
}

// 关闭所有标签
async function handleCloseAll() {
  await pagesStore.pruneCurrentVisited()
}

// 关闭单个标签
async function handleTabRemove(tab: any, event: MouseEvent) {
  event.stopPropagation()
  await pagesStore.removeCurrentVisited(tab)
}
</script>

<style lang="scss" scoped>
.app-nav {
  height: $app-nav-height;
  background: white;

  &__header {
    position: relative;
    margin: 0;
    padding: 0;
    border-bottom: none;
    height: 32px;
    padding-top: 4px;
  }

  &__popover {
    ul,
    li {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    position: fixed;
    cursor: pointer;
    background: #ffffff;
    z-index: 10000;
    box-shadow: 0px 2px 4px 2px #eeeeee;

    .action-item {
      padding: 10px 20px;
      font-size: 14px;
      &:hover {
        background: #f4f3f3;
      }
    }
  }
}
</style>

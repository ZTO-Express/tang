<template>
  <el-menu
    class="app-menu"
    :unique-opened="false"
    :default-active="activedMenuName"
    :default-openeds="openedMenuNames"
    :collapse="collapse"
    background-color="#0e1524"
    text-color="#909399"
    active-text-color="#fff"
    @select="handleSelect"
  >
    <template v-for="menu in navMenu.menus" :key="menu.name">
      <template v-if="!menu.meta?.hidden">
        <el-menu-item v-if="menu.meta?.leaf || !menu.children?.length" :index="menu.name">
          <i v-if="menu.icon" :class="`el-${menu.icon}`" />
          <template #title>{{ menu.title }}</template>
        </el-menu-item>
        <el-sub-menu v-else :index="menu.name">
          <template #title>
            <img v-if="menu.icon" class="img-icon" :src="menu.icon" />
            <span>{{ menu.title }}</span>
          </template>
          <template v-for="_menu in menu.children" :key="_menu.name">
            <el-menu-item v-if="!_menu.meta?.hidden" :index="_menu.name">
              <img v-if="_menu.icon" class="img-icon" :src="_menu.icon" />
              <template #title>{{ _menu.title }}</template>
            </el-menu-item>
          </template>
        </el-sub-menu>
      </template>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { vue, vueRouter, useAppRoute, useAppRouter, useAppStore, useConfig } from '@zto/zpage'
import { useMessage } from '../../composables'

import type { NavMenuItem } from '@zto/zpage'

const { computed, ref, onMounted } = vue
const { onBeforeRouteUpdate } = vueRouter

const props = defineProps<{
  collapse?: boolean
}>()

const store = useAppStore()
const router = useAppRouter()
const route = useAppRoute()

const navMenu = computed(() => store.getters.navMenu)

// 最多导航条
const maxNavs = useConfig('app.menu.maxNavs', 10)
const { Message } = useMessage()

const openedMenuNames = ref<Array<string>>([])
const activedMenuName = ref<string>('')

onMounted(() => {
  _onRouteChange(route)
})

onBeforeRouteUpdate(async (to, from) => {
  _onRouteChange(to)
})

/**
 * 选中菜单时触发
 */
function handleSelect(index: string, indexPath: string, item: any) {
  const route = router.getRouteByName(index)
  const meta = route?.meta

  if (meta?.cache !== false) {
    const navPages = store.getters.navPages
    if (navPages && navPages.length >= maxNavs) {
      Message.warning(`至多打开${maxNavs}个页面,请关闭不使用的页面后再次尝试！`)
      return
    }
  }

  // 不能用goto，否则可能导致切换menu后任然缓存页面
  router.push({ name: index, query: meta?.query as any })
}

/**
 * 路由改变时触发
 */
function _onRouteChange(route: any) {
  const menuName = String(route.name)

  activedMenuName.value = menuName

  const allMenus = navMenu.value.menus as NavMenuItem[]
  const currentMenu = allMenus.find(it => it.name === menuName)

  if (currentMenu) {
    openedMenuNames.value = _getParentMenuNames(currentMenu, allMenus, [])
  } else {
    openedMenuNames.value = []
  }
}

// 获取当前路由所有父节点名称
function _getParentMenuNames(menu: NavMenuItem, allMenus: NavMenuItem[], cached: string[]) {
  if (!menu.parentId) return cached

  const parentMenu = allMenus.find(it => it.id === menu.parentId)
  if (!parentMenu) return cached

  cached.push(parentMenu.name)

  _getParentMenuNames(parentMenu, allMenus, cached)

  return cached
}
</script>

<style lang="scss" scoped>
.app-menu {
  width: 100%;
  height: 100%;
  padding-top: 10px;
  border-right: 0;
}

.img-icon {
  height: 12px;
  margin-right: 5px;
  opacity: 0.5;
}

:deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  min-width: calc(100% - 1px);
  font-size: 14px;

  &.is-active {
    background: url(https://uedcdn.zto.com/static/working/menu-bg.png) left top no-repeat;

    .img-icon {
      opacity: 1;
    }
  }
}

:deep(.el-sub-menu) {
  .el-menu-item {
    min-width: 100px;
  }
}

:deep(.el-sub-menu__title) {
  font-size: 14px;
  height: 50px;
  line-height: 50px;
}
</style>

import { defineComponent, h } from 'vue'

import { ROOT_ROUTE_NAME, ROOT_MENU_PREFIX } from '../../consts'
import { _, uniqId, qs, warn, flattenTree, getPageKey } from '../../utils'
import { useConfig } from '../../config'
import { findRepeats } from '../../utils/helper'
import CPageLayout from '../components/CPageLayout'

import { defaultMenus } from '../options/defaults'

import type { VNode } from 'vue'
import type { Router, RouteRecordRaw } from 'vue-router'
import type { NavMenuItem, NavMenuItemConfig, Submodule } from '../../typings'

// 已缓存节点
const __cachedNodes: Record<string, VNode> = {}

/** 根据根据应用导航菜单配置构建路由 */
export function createAppRoutes(router: Router, submodules: Submodule[]) {
  const exMenus = useConfig('menus', [])

  // 规范化外部配置菜单
  _normalizeMenus(exMenus)

  const defMenus: NavMenuItemConfig[] = defaultMenus() || []

  // 规范化默认菜单
  _normalizeMenus(defMenus)

  // 合并外部配置路由到默认路由
  _mergeMenus(defMenus, exMenus)

  // 外部配置菜单
  const appendedMenus: NavMenuItemConfig[] = defMenus.filter((it: any) => {
    // 需要根据是否权限配置确定是否显示
    if (it.isAuth && it.name) {
      const authMenu = _findMenuByName(submodules, it.name, true)
      return !!authMenu
    }

    return true
  })

  // 合并外部配置路由及默认路由到子模块
  _mergeMenus(submodules, appendedMenus)

  // 创建路由之前，先对子模块及其下菜单进行排序
  _sortMenus(submodules)

  // 获取所有子模块菜单的name
  const allMenus = flattenTree(submodules)
  const allMenuNames = allMenus.map(it => it.name)

  // 检查是否存在重复的key
  const repeatedNames = findRepeats(allMenuNames)
  if (repeatedNames.length) throw new Error(`存在重复的菜单名"${repeatedNames.join()}"`)

  submodules.forEach(it => {
    _createSubRoute(router, it, it)
  })
}

/** 清理缓存 */
export function pruneCachedPage(router: Router, page: any) {
  const key = page?.key

  if (key && __cachedNodes[key]) {
    __cachedNodes[key] = undefined as any
    delete __cachedNodes[key]
  }

  if (page?.isTemp && page?.name) {
    router.removeRoute(page?.name)
  }
}

/** 新增临时路由 */
export function createTmpRoute(router: Router, menu: NavMenuItem, submodule: Submodule) {
  menu.meta = Object.assign(
    {
      hidden: true,
      isTemp: true
    },
    menu.meta,
    {
      noCache: false
    }
  )

  // 不继承noCache
  delete menu.meta.noCache

  // 不继承redirectQuery
  delete menu.meta.redirectQuery

  menu.name = `${menu.name}__tmp_${uniqId()}`

  return _createSubRoute(router, menu, submodule)
}

/** 根据导航菜单构建路由 */
function _createSubRoute(router: Router, menu: NavMenuItem, submodule: Submodule) {
  // 有路径的菜单才有路由
  if (menu.path) {
    const pathInfo = _parseMenuPath(menu.path)
    pathInfo.query = Object.assign({}, pathInfo.query, menu.query)

    // 路由源数据
    const routeMeta = Object.assign(
      {
        type: 'page',
        name: menu.name,
        parentName: menu.parentName,
        submodule: submodule.name,
        isRoot: false, // 是否根页面
        icon: menu.icon,
        label: menu.title,
        count: menu.children?.length || 0,
        refererKey: menu.refererKey,
        menuPath: menu.path,
        schema: menu.schema,
        teleportTo: menu.teleportTo,
        ...pathInfo
      },
      menu.meta,
      {
        menu
      }
    )

    const pageKey = getPageKey(routeMeta)

    // 第一个创建的路由作为子模块的默认路由
    if (!submodule.defaultMenu && !menu.meta?.hidden) {
      submodule.defaultMenu = menu
    }

    // 已存在的页面key
    const existsRoute = router.getRouteByPageKey(pageKey)
    if (existsRoute) return existsRoute

    routeMeta.pageKey = pageKey

    const route: RouteRecordRaw = {
      name: menu.name,
      ...pathInfo,
      meta: routeMeta
    }

    if (menu.redirect) {
      route.redirect = menu.redirect
    } else {
      route.component = _resolvePageComponent(routeMeta)
    }

    if (menu.path.startsWith(ROOT_MENU_PREFIX)) {
      // 以ROOT_MENU_PREFIX前缀开头，直接添加路由
      menu.path = menu.path.substring(ROOT_MENU_PREFIX.length)
      routeMeta.isRoot = true
      routeMeta.path = menu.path

      router.addRoute(route)
    } else {
      // 添加路由到根路由下
      router.addRoute(ROOT_ROUTE_NAME, route)
    }

    return route
  }

  if (menu.children?.length) {
    menu.children.forEach(it => {
      _createSubRoute(router, it, submodule)
    })
  }
}

/** 解析菜单路径 */
function _parseMenuPath(path: string) {
  const result: any = { path }
  if (path.indexOf('?') > 0) {
    const pathStr = path.substring(0, path.indexOf('?'))
    const queryStr = path.substring(pathStr.length + 1)

    result.path = pathStr
    result.query = qs.parse(queryStr)
  }
  return result
}

/**
 * 规范化外部菜单
 * 1. 为没有name值的菜单附加自定义name值并告警
 * 2. 附加parentName
 * 3. 设置默认order
 */
function _normalizeMenus(exMenus: NavMenuItemConfig[]) {
  exMenus.forEach((it, index) => {
    if (!it.name) {
      it.name = _tmpMenuName()
      warn(`建议为菜单${it.title}提供键。`)
    }

    it.order = it.order || index

    if (it.name === 'singles') {
      it.meta = { isSingle: true, ...it.meta }
    }

    // 设置子菜单的parentName
    if (it.children?.length) {
      it.children.forEach(_it => {
        _it.parentName = it.name

        if (it.meta?.isSingle) {
          _it.meta = { isSingle: true, ..._it.meta }
        }
      })

      _normalizeMenus(it.children)
    }
  })
}

/** 临时菜单标记 */
let __tmpMenuIndex = 1

// 获取临时菜单Name
function _tmpMenuName() {
  return `_tmp_${new Date().getTime()}_${++__tmpMenuIndex}`
}

/**
 * 合并路由到目标路由
 * 合并原则：
 * 1. 如果没有key，则忽略此菜单
 * 2. 如果有相同的key，则使用exMenu中相同key的属性进行覆盖
 * 3. 如果没有相同的key，能找到parentName，则附加到指定parentName对应的menu下，若无法找到parentName，则算不存在
 * 4. 如果没有parentName，且isSubmodule不为true，则附加为隐藏菜单且没有父菜单
 * 5. 如果没有parentName，且isSubmodule为true，则附加为新的子模块
 * 6. 合并时，所有菜单的子菜单合并到父级菜单，若子菜单key与其他菜单有冲突，则报错
 */
function _mergeMenus(menus: NavMenuItemConfig[], exMenus: NavMenuItemConfig[]) {
  exMenus.forEach(it => {
    _mergeMenu(menus, it)
  })
}

/** 合并只存在于同级别中 */
function _mergeMenu(menus: NavMenuItemConfig[], exMenu: NavMenuItemConfig) {
  // 没有key则无法合并
  if (!exMenu?.name) return

  // 查找指定的菜单
  const menuIndex = menus.findIndex(it => it.name === exMenu.name)

  // 没有找到指定的菜单，则查找相关
  if (menuIndex < 0) {
    let pMenu: any = null
    if (exMenu.parentName) pMenu = _findMenuByName(menus, exMenu.parentName, true)

    if (!pMenu) {
      menus.push(exMenu as Submodule)
      return
    }

    // 附加到当前节点的子节点
    pMenu.children = [...(pMenu.children || []), exMenu as NavMenuItem]
    return
  }

  const menu = Object.assign(
    {
      children: []
    },
    menus[menuIndex],
    _.omit(exMenu, ['children'])
  )

  // order重设（优选取非0值）
  menu.order = exMenu.order || menus[menuIndex].order

  if (exMenu.children?.length) {
    _mergeMenus(menu.children, exMenu.children)
  }

  menus[menuIndex] = menu
}

/** 菜单应用排序 */
function _sortMenus(menus: NavMenuItem[]) {
  menus.sort((a, b) => {
    if (a.order > b.order) return 1
    else if (a.order < b.order) return -1
    else if (a.name > b.name) return 1
    else if (a.name < b.name) return -1
    else return 0
  })

  menus.forEach(menu => {
    menu.children?.length && _sortMenus(menu.children as NavMenuItem[])
  })

  return menus
}

/**
 * 通过key查找指定的菜单
 * @param menus 目标菜单
 * @param key 要查找的key
 * @param recursive 是否递归查询（默认false）
 * @returns
 */
function _findMenuByName(menus: NavMenuItemConfig[], name: string, recursive = false): NavMenuItemConfig | undefined {
  if (!name || !menus?.length) return undefined

  let menu = menus.find(it => it.name === name)
  if (menu) return menu

  if (recursive) {
    for (const it of menus) {
      if (it.children) {
        menu = _findMenuByName(it.children as NavMenuItem[], name, recursive)
        if (menu) return menu
      }
    }
  }

  return undefined
}

/** 由路由元数据获取页面组件 */
function _resolvePageComponent(routeMeta: any) {
  const pageCmpt = defineComponent({
    name: routeMeta.pageKey,

    setup: () => {
      return () => {
        return h(CPageLayout, {
          pagePath: routeMeta.path,
          pageSchema: routeMeta.schema,
          teleportTo: routeMeta.teleportTo
        })
      }
    }
  })

  return pageCmpt
}

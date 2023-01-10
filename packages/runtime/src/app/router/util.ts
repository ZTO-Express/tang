import { defineComponent, h } from 'vue'

import { ROOT_ROUTE_NAME, ROOT_MENU_PREFIX } from '../../consts'
import { _, strings, uniqId, qs, warn, flattenTree, getPageKey } from '../../utils'
import { findRepeats } from '../../utils/helper'
import CPageLayout from '../components/CPageLayout'
import CMicroLayout from '../components/CMicroLayout'

import { defaultMenus } from '../options/defaults'

import type { Router, RouteRecordRaw } from 'vue-router'
import type { NavMenuItem, NavMenuItemConfig, Submodule } from '../../typings'
import type { App } from '../App'

/** 根据根据应用导航菜单配置构建路由 */
export function createAppRoutes(router: Router, submodules: Submodule[], options: any = {}) {
  const baseRoute = options.baseRoute || ''
  const exMenus = options.menus || []

  // 规范化外部配置菜单
  _normalizeMenus(exMenus)

  const defMenus: NavMenuItemConfig[] = defaultMenus() || []

  // 规范化默认菜单
  _normalizeMenus(defMenus)

  // 合并外部配置路由到默认路由
  _mergeMenus(defMenus, exMenus)

  // 外部配置菜单
  const appendedMenus: NavMenuItemConfig[] = _filterAuthMenus(defMenus, submodules)

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
    _createSubRoute(router, it, it, baseRoute)
  })
}

/** 清理缓存 */
export function pruneCachedPage(router: Router, page: any) {
  const key = page?.key

  if (key && router.__cachedNodes[key]) {
    router.__cachedNodes[key] = undefined as any
    delete router.__cachedNodes[key]
  }

  if (page?.isTemp && page?.name) {
    router.removeRoute(page?.name)
  }
}

/** 新增临时路由 */
export function createTmpRoute(router: Router, menu: NavMenuItem, submodule: Submodule, baseRoute = '') {
  menu.meta = { hidden: true, isTemp: true, ...menu.meta, noCache: false }

  // 不继承noCache
  delete menu.meta.noCache

  // 不继承redirectQuery
  delete menu.meta.redirectQuery

  menu.name = `${menu.name || ''}__tmp_${uniqId()}`

  // __title用于刷新时作为路由的label
  menu.query = { __title: menu.title, __submodule: submodule?.name || '', ...menu.query }

  return _createSubRoute(router, menu, submodule, baseRoute)
}

/** 根据导航菜单构建路由 */
function _createSubRoute(router: Router, menu: NavMenuItem, submodule: Submodule, baseRoute = '') {
  let route: RouteRecordRaw | undefined = undefined

  // 是否微前端菜单
  const isMicroMenu = menu.isMicro

  if (isMicroMenu && !menu.path) throw new Error('请设置微前端路径')

  // 有路径的菜单才有路由
  if (menu.path) {
    // 路径必须以‘/’开头
    menu.path = normalizeMenuPath(menu.path)

    const pathInfo = _parseMenuPath(menu.path, baseRoute)

    pathInfo.query = { ...pathInfo.query, ...menu.query }

    // 路由源数据
    const routeMeta = {
      type: isMicroMenu ? 'micro' : 'page',
      name: menu.name,
      parentName: menu.parentName,
      submodule: submodule.name,
      isSubmodule: menu.isSubmodule,
      isRoot: false, // 是否根页面
      isMicro: isMicroMenu,
      icon: menu.icon,
      label: menu.title,
      count: menu.children?.length || 0,
      refererKey: menu.refererKey,
      menuPath: menu.path,
      schema: menu.schema,
      teleportTo: menu.teleportTo,
      ...pathInfo,
      ...menu.meta,
      menu
    }

    const pageKey = getPageKey(routeMeta)

    // 第一个创建的路由作为子模块的默认路由
    if (!submodule.defaultMenu && !menu.meta?.hidden) {
      submodule.defaultMenu = menu
    }

    // 已存在的页面key
    const existsRoute = router.getRouteByPageKey(pageKey)
    if (existsRoute) return existsRoute

    routeMeta.pageKey = pageKey

    route = {
      name: menu.name,
      ...pathInfo,
      meta: routeMeta
    }

    if (menu.redirect) {
      route!.redirect = menu.redirect
    } else if (isMicroMenu) {
      route!.component = _resolveMicroComponent(routeMeta)
    } else {
      route!.component = _resolvePageComponent(routeMeta)
    }

    if (menu.path.startsWith(ROOT_MENU_PREFIX)) {
      // 以ROOT_MENU_PREFIX前缀开头，直接添加路由
      menu.path = menu.path.substring(ROOT_MENU_PREFIX.length)
      routeMeta.isRoot = true
      routeMeta.path = menu.path

      router.addRoute(route!)
    } else {
      // 添加路由到根路由下
      router.addRoute(ROOT_ROUTE_NAME, route!)
    }
  }

  if (menu.children?.length && !isMicroMenu) {
    menu.children.forEach(it => {
      // 合并路由器
      it.path = combinePath(menu.path, it.path)

      _createSubRoute(router, it, submodule)
    })
  }

  return route
}

/** 处理初次加载位置 */
export async function processAppInitialLocation(app: App) {
  if (!location.hash) return

  const hashPath = location.hash.substring(1)
  const pathInfo = _parseMenuPath(hashPath)

  if (!pathInfo?.path) return // 路径不存在则不作处理

  const existsRoute = app.router.getRouteByMenuPath(pathInfo.path)
  if (existsRoute) return // route已存在则不作处理

  const existsPage = app.pages.find(it => it.path === pathInfo.path)
  if (!existsPage) return // 页面不存在则不作处理

  // 是否存在父路由(参考路由)，用父节点的pageKey作为refererKey
  const parentPath = pathInfo.path.substring(0, pathInfo.path.lastIndexOf('/'))
  const existsParentRoute = parentPath ? app.router.getRouteByMenuPath(parentPath) : null
  const refererKey = existsParentRoute?.meta?.pageKey

  // 尝试用query.__submodule作为submodule
  const submodule = pathInfo.query?.__submodule || existsParentRoute?.meta?.submodule
  pathInfo.query = { ...pathInfo.query }

  // 尝试用query.__title作为title
  const title = pathInfo.query?.__title

  await app.router.goto({
    title,
    submodule,
    refererKey,
    ...pathInfo
  })
}

/** 解析菜单路径 */
function _parseMenuPath(path: string, baseRoute = '') {
  const result: any = { path }

  if (path.indexOf('?') > 0) {
    const pathStr = path.substring(0, path.indexOf('?'))
    const queryStr = path.substring(pathStr.length + 1)

    result.path = pathStr
    result.query = qs.parse(queryStr)
  }

  if (baseRoute) {
    const _base = strings.trim(baseRoute, '/')
    const _path = strings.trim(result.path, '/')

    result.path = `${_base}/${_path}`
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

    // it.order = it.order || index

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

  const menu = {
    children: [],
    ...menus[menuIndex],
    ..._.omit(exMenu, ['children'])
  }

  // order重设（优选取非0值）
  menu.order = exMenu.order || menus[menuIndex].order

  if (exMenu.children?.length) {
    _mergeMenus(menu.children, exMenu.children)
  }

  menus[menuIndex] = menu
}

/** 菜单应用排序 */
function _sortMenus(menus: NavMenuItem[]) {
  // 设置默认排序号
  let preOrder = 0
  menus.forEach(it => {
    if (!it.order) {
      preOrder++
      it.order = preOrder
    } else {
      preOrder = it.order
    }
  })

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

/** 过滤掉没有权限的菜单 */
function _filterAuthMenus(menus: NavMenuItemConfig[], authMenus: NavMenuItem[]) {
  if (!menus?.length) return []

  const filteredMenus = menus.filter((it: any) => {
    // 需要根据是否权限配置确定是否过滤
    if (it.isAuth && it.name) {
      const authMenu = _findMenuByName(authMenus, it.name, true)
      return !!authMenu
    }

    return true
  })

  filteredMenus.forEach(it => {
    if (it.children?.length) {
      it.children = _filterAuthMenus(it.children, authMenus)
    }
  })

  return filteredMenus
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

  const menu = menus.find(it => it.name === name)
  if (menu) return menu

  if (recursive) {
    for (const it of menus) {
      if (it.children) {
        const m = _findMenuByName(it.children as NavMenuItem[], name, recursive)
        if (m) return m
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

/** 由路由元数据获取微前端组件 */
function _resolveMicroComponent(routeMeta: any) {
  const pageCmpt = defineComponent({
    name: routeMeta.pageKey,

    setup: () => {
      return () => {
        return h(CMicroLayout, { path: routeMeta.path, meta: routeMeta })
      }
    }
  })

  return pageCmpt
}

/** 路径必须以'/'开头 */
function normalizeMenuPath(path: string) {
  if (!path) return path

  if (!path.startsWith('/')) path = `/${path}`

  return path
}

/** 合并路径 */
function combinePath(basePath?: string, targetPath?: string) {
  if (!targetPath) return ''

  basePath = basePath || ''
  targetPath = targetPath || ''

  if (targetPath.startsWith('/')) return targetPath

  if (basePath) {
    if (!basePath.startsWith('/')) basePath = '/' + basePath
    if (!basePath.endsWith('/')) basePath += '/'
  } else {
    basePath = '/'
  }

  return `${basePath}${targetPath}`
}

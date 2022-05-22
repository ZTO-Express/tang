import { createRouter, createWebHashHistory } from 'vue-router'
import { ROOT_ROUTE_NAME } from '../../consts'
import { getPageKey, tpl, _ } from '../../utils'
import { pruneCachedPage } from './util'

import type { Router } from 'vue-router'
import type { AppRouterConfig, PageInfoData } from '../../typings'
import type { App } from '../App'

export function createAppRouter(app: App, config?: AppRouterConfig) {
  const _router: Router = config?.router
    ? config.router
    : createRouter({
        history: createWebHashHistory(),
        routes: config?.routes || []
      })

  if (!_router.__cachedNodes) {
    _router.__cachedNodes = {}
  }

  /** 跳转至首页 */
  if (!_router.goHome) {
    _router.goHome = async () => {
      return await _router.push({ name: ROOT_ROUTE_NAME })
    }
  }

  /** 跳转至特定页面 */
  if (!_router.goto) {
    _router.goto = async (to: any) => {
      if (typeof to === 'string' && (to.startsWith('http:') || to.startsWith('https:'))) {
        window.open(to)
        return
      }

      if (to.name) {
        // 获取模版路由
        const tmplRoute = _router.getRouteByName(to.name)
        if (tmplRoute?.meta?.menu) {
          const tmplData = app.deepFilter(tmplRoute?.meta?.menu, to.data || {})
          to = Object.assign({}, tmplData, to)
        }
      }

      let refererKey = to.refererKey
      const currentRoute = _router.currentRoute
      if (!refererKey) {
        refererKey = currentRoute.value.meta?.pageKey as string
      }

      if (refererKey) {
        to.meta = { ...to.meta, refererKey }
      }

      const pageKey = getPageKey(to)

      // 防止死循环
      if (pageKey === refererKey) return

      const keeyAlive = app.useAppConfig('page.keeyAlive')
      const { pagesStore, appStore } = app.stores

      if (!keeyAlive) {
        if (!refererKey) {
          // 没有引用页面则直接清空
          await pagesStore.pruneCurrentVisited({
            submodule: 'ALL',
            redirect: false
          })
        } else if (currentRoute.value?.meta) {
          // 将当前页加入缓存页
          await pagesStore.addCurrentVisited({ redirect: false })
        }
      }

      const toRoute = _router.getRouteByPageKey(pageKey)

      // 若路由不存在则新增路由
      if (!toRoute) {
        to.submodule = to.submodule || appStore.navMenu?.submodule

        // 当前路由不存在，则新增临时路由
        await pagesStore.addTemp(to)

        return await _router.push(to)
      } else {
        return await _router.push(toRoute.meta)
      }
    }
  }

  /** 返回 */
  if (!_router.goBack) {
    _router.goBack = async () => {
      const route = _router.currentRoute
      const refererKey = route.value.meta?.refererKey as string

      if (refererKey) {
        const refererRoute = _router.getRouteByPageKey(refererKey)
        const rerfereMeta = refererRoute?.meta

        if (rerfereMeta?.name) {
          return await _router.push({
            name: rerfereMeta.name as string,
            query: rerfereMeta.query as any
          })
        }
      }

      return _router.go(-1)
    }
  }

  if (!_router.close) {
    _router.close = async (pageKey?: string) => {
      const { pagesStore } = app.stores

      const showNav = app.useAppConfig('menu.showNav')

      if (!showNav) {
        _router?.goBack()
      } else {
        const route = _router.currentRoute.value
        pageKey = (pageKey || route?.meta?.pageKey) as string

        if (!pageKey) return

        await pagesStore.removeCurrentVisited({ key: pageKey })
      }
    }
  }

  /** 根据名称获取指定的路由 */
  if (!_router.getRouteByName) {
    _router.getRouteByName = (name: string) => {
      const routes = _router.getRoutes()
      const route = routes.find(it => it.name === name)
      return route
    }
  }

  if (!_router.getCurrentPageKey) {
    _router.getCurrentPageKey = () => {
      const route = _router.currentRoute
      return route.value?.meta?.pageKey as string
    }
  }

  /** 根据PageKey获取指定的路由 */
  if (!_router.getRouteByPageKey) {
    _router.getRouteByPageKey = (key: string) => {
      if (!key) return undefined

      const routes = _router.getRoutes()
      const route = routes.find(it => it.meta?.pageKey === key)
      return route
    }
  }

  /** 根据PageKey获取指定的路由 */
  if (!_router.getRouteByMenuPath) {
    _router.getRouteByMenuPath = (menuPath: string) => {
      if (!menuPath) return undefined

      const routes = _router.getRoutes()
      const route = routes.find(it => it.meta?.menuPath === menuPath)
      return route
    }
  }

  /** 清理当前页面缓存 */
  if (!_router.pruneCurrentPage) {
    _router.pruneCurrentPage = () => {
      const route = _router.currentRoute?.value
      if (!route?.meta) return

      pruneCachedPage(_router, route.meta)
    }
  }

  if (config?.beforeResolve) {
    _router.beforeResolve(config?.beforeResolve)
  }

  if (config?.onError) {
    _router.onError(config?.onError)
  }

  if (config?.beforeEach) {
    _router.beforeEach(config?.beforeEach)
  } else {
    _router.beforeEach(async (to, from, next) => {
      if (!from.name) {
        if (to.name === '404') {
          next({ name: ROOT_ROUTE_NAME, replace: true })
          return
        }

        if (to.meta?.isTemp) {
          if (to.meta?.parentName) {
            next({ name: to.meta.parentName as string, replace: true })
          } else {
            next({ name: ROOT_ROUTE_NAME, replace: true })
          }
          return
        } else if (!to.meta?.redirectQuery) {
          // vue router的match只关注path，这里通过path和query进行匹配
          const menuPath = location.hash.substring(1)
          const route = _router.getRouteByMenuPath(menuPath)
          if (route?.name && route.name !== to.name) {
            next({ name: route.name, query: to.query, replace: true })
            return
          }
        }
      }

      if (to.meta?.redirectQuery) {
        const query = Object.assign({}, to.query, to.meta?.redirectQuery)

        if (!_.deepEqual(query, to.query)) {
          next({ name: to.name as string, query, replace: true })
          return
        }
      }

      if (to.meta?.submodule && !to.meta?.isSingle) {
        await app.stores.appStore.changeSubmodule({
          name: to.meta?.submodule,
          to
        })
      }

      next()
    })
  }

  if (config?.afterEach) {
    _router.afterEach(config?.afterEach)
  } else {
    _router.afterEach(async (to, from) => {
      const keeyAlive = app.useAppConfig('page.keeyAlive')
      const { pagesStore } = app.stores
      await pagesStore.setCurrent((to.meta?.pageKey || to.name) as string)

      // 移除临时路由
      if (keeyAlive === false && from.name && from.meta?.isTemp) {
        await pagesStore.removeTemp({ ...from.meta, name: from.name } as PageInfoData)
      }
    })
  }

  return _router
}

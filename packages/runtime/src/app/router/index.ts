import { useRoute, createRouter, createWebHashHistory } from 'vue-router'
import { ROOT_ROUTE_NAME } from '../../consts'
import { getPageKey, tpl, _ } from '../../utils'
import { useConfig } from '../../config'
import { useAppStore } from '../store'
import { useAppContext } from '../composables'
import { pruneCachedPage } from './util'

import type { Router } from 'vue-router'
import type { AppRouterConfig } from '../../typings'

let router: Router | undefined = undefined

export function createAppRouter(config?: AppRouterConfig) {
  if (router) return router

  const store = useAppStore()

  if (config?.router) {
    router = config.router
  } else {
    // 安装路由
    router = createRouter({
      history: createWebHashHistory(),
      routes: config?.routes || []
    })
  }

  /** 跳转至首页 */
  if (!router.goHome) {
    router.goHome = async () => {
      if (!router) return

      return await router.push({ name: ROOT_ROUTE_NAME })
    }
  }

  /** 跳转至特定页面 */
  if (!router.goto) {
    router.goto = async (to: any) => {
      if (!router) return

      if (typeof to === 'string' && (to.startsWith('http:') || to.startsWith('https:'))) {
        window.open(to)
        return
      }

      if (to.name) {
        const ctx = useAppContext(to.data || {})

        // 获取模版路由
        const tmplRoute = router.getRouteByName(to.name)
        if (tmplRoute?.meta?.menu) {
          const tmplData = tpl.deepFilter(tmplRoute?.meta?.menu, ctx)
          to = Object.assign({}, tmplData, to)
        }
      }

      let refererKey = to.refererKey
      const currentRoute = router.currentRoute
      if (!refererKey) {
        refererKey = currentRoute.value.meta?.pageKey as string
      }

      if (refererKey) {
        to.meta = { ...to.meta, refererKey }
      }

      const pageKey = getPageKey(to)

      // 防止死循环
      if (pageKey === refererKey) return

      const keeyAlive = useConfig('app.page.keeyAlive')
      if (!keeyAlive) {
        if (!refererKey) {
          // 没有引用页面则直接清空
          await store.dispatch('pages/pruneVisited', 'ALL')
        } else if (currentRoute.value?.meta) {
          // 将当前页加入缓存页
          await store.dispatch('pages/addVisited', currentRoute.value)
        }
      }

      const toRoute = router.getRouteByPageKey(pageKey)

      // 若路由不存在则新增路由
      if (!toRoute) {
        to.submodule = to.submodule || store.getters.navMenu?.submodule

        // 当前路由不存在，则新增临时路由
        await store.dispatch('pages/addTemp', to)
        return await router.push(to)
      } else {
        return await router.push(toRoute.meta)
      }
    }
  }

  /** 返回 */
  if (!router.goBack) {
    router.goBack = async () => {
      if (!router) return

      const route = router.currentRoute
      const refererKey = route.value.meta?.refererKey as string

      if (refererKey) {
        const refererRoute = router.getRouteByPageKey(refererKey)
        const rerfereMeta = refererRoute?.meta

        if (rerfereMeta?.name) {
          return await router.push({
            name: rerfereMeta.name as string,
            query: rerfereMeta.query as any
          })
        }
      }

      return router.go(-1)
    }
  }

  /** 根据名称获取指定的路由 */
  if (!router.getRouteByName) {
    router.getRouteByName = (name: string) => {
      if (!router) return

      const routes = router.getRoutes()
      const route = routes.find(it => it.name === name)
      return route
    }
  }

  /** 根据PageKey获取指定的路由 */
  if (!router.getRouteByPageKey) {
    router.getRouteByPageKey = (key: string) => {
      if (!key || !router) return undefined

      const routes = router.getRoutes()
      const route = routes.find(it => it.meta?.pageKey === key)
      return route
    }
  }

  /** 根据PageKey获取指定的路由 */
  if (!router.getRouteByMenuPath) {
    router.getRouteByMenuPath = (menuPath: string) => {
      if (!menuPath || !router) return undefined

      const routes = router.getRoutes()
      const route = routes.find(it => it.meta?.menuPath === menuPath)
      return route
    }
  }

  if (config?.beforeResolve) {
    router.beforeResolve(config?.beforeResolve)
  }

  if (config?.onError) {
    router.onError(config?.onError)
  }

  if (config?.beforeEach) {
    router.beforeEach(config?.beforeEach)
  } else {
    router.beforeEach(async (to, from, next) => {
      if (!router) return

      if (!from.name) {
        if (to.meta?.isTemp) {
          if (to.meta?.parentName) {
            next({ name: to.meta.parentName as string, replace: true })
          } else {
            await router.goHome()
          }
          return
        } else if (!to.meta?.redirectQuery) {
          // vue router的match只关注path，这里通过path和query进行匹配
          const menuPath = location.hash.substring(1)
          const route = router.getRouteByMenuPath(menuPath)
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
        await store.dispatch('app/changeSubmodule', {
          name: to.meta?.submodule,
          to
        })
      }

      next()
    })
  }

  if (config?.afterEach) {
    router.afterEach(config?.afterEach)
  } else {
    router.afterEach(async (to, from) => {
      if (!router) return

      await store.dispatch('pages/setCurrent', to.meta?.pageKey || to.name)

      const keeyAlive = useConfig('app.page.keeyAlive')

      // 移除临时路由
      if (keeyAlive === false && from.name && from.meta?.isTemp) {
        await store.dispatch('pages/removeVisited', {
          name: from.name
        })
        router.removeRoute(from.name)
      }
    })
  }

  return router
}

// 获取当前router
export function useAppRouter() {
  return router as Router
}

export function useAppRoute() {
  return useRoute()
}

// 清理当前页面
export function pruneCurrentPage() {
  if (!router) return

  const route = router.currentRoute?.value
  if (!route?.meta) return

  pruneCachedPage(router, route.meta)
}

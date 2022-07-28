import { reactive } from 'vue'

import { _ } from '../../../utils'
import { STORE_NAME } from '../../../consts'
import { pruneCachedPage, createTmpRoute } from '../../router/util'
import { defineStore, setData } from '../util'
import { App } from '../../App'

import type {
  PagesState,
  PagesGetters,
  PagesActions,
  PageInfo,
  NavMenuItem,
  SetDataOptions,
  PageInfoData
} from '../../../typings'

export function definePagesStore(app: App) {
  const appName = app.name

  return defineStore<PagesState, PagesGetters, PagesActions>(STORE_NAME.PAGES, {
    appName,

    state: () => {
      return {
        current: '',
        defaults: [],
        visited: [],
        datas: {} // 页面数据
      }
    },

    getters: {
      currentPage: state => {
        const pageKey = state.current
        const pageData = state.datas[pageKey] || {}
        return { key: pageKey, data: pageData }
      },
      navPages: state => {
        const { appStore } = app.stores

        const visited = state.visited
        const submodule = appStore.navMenu?.submodule

        const items = visited.filter((it: any) => {
          return !submodule || !it.submodule || it.submodule === submodule
        })

        return items
      }
    },

    actions: {
      setCurrent(pageKey: string) {
        this.current = pageKey
      },

      // 设置默认页面
      async setDefaults(pages: PageInfo[]) {
        this.defaults = pages
      },

      // 新增已访问页面
      addVisited(page: PageInfo) {
        if (!page.pageKey || page.noCache) return
        if (!page.key) page.key = page.pageKey

        // 已存在于visited的 如果是详情页，详情id也存在的。不添加
        if (this.visited.some(v => isSamePage(v, page))) return

        const newPage: PageInfo = _.deepClone(page)

        // 标签刷新记住位置
        let index = 0

        const refererKey = page.refererKey

        // 打开详情时放在最新主页面后
        if (refererKey) {
          index = this.visited.findIndex(item => item.key === refererKey) + 1
        } else {
          index = this.visited.length
        }

        if (newPage.default === true) {
          this.visited = [newPage, ...this.visited]
        } else {
          this.visited.splice(index, 0, newPage)
          this.visited = [...this.visited]
        }
      },

      async addCurrentVisited(payload = { redirect: true }) {
        const router = app.router
        if (!router) return

        const page = payload?.route?.meta

        if (!page?.pageKey || page.noCache) return
        if (!page.key) page.key = page.pageKey

        // 已存在于visited的 如果是详情页，详情id也存在的。不添加
        if (this.visited.some(v => isSamePage(v, page))) return

        this.addVisited(page)

        if (payload?.redirect !== false) {
          await router.goto({ name: page.name, query: page.query })
        }
      },

      // 删除已访问过的页面
      removeVisited(page: PageInfoData) {
        const router = app.router
        if (!router) return

        const datas = this.datas || {}

        const visitedArr: PageInfo[] = []
        const pageDatas: any = {}

        for (const [i, v] of this.visited.entries()) {
          if (isSamePage(v, page) && page.closeable !== false) {
            pruneCachedPage(router, page)
          } else {
            visitedArr.push(v)
            if (datas[v.key]) pageDatas[v.key] = datas[v.key]
          }
        }

        this.visited = visitedArr
        this.datas = pageDatas
      },

      async removeCurrentVisited(page: PageInfoData) {
        const router = app.router
        if (!page || !router) return false

        const navItems = this.navPages
        if (!navItems.length) {
          await router.goHome()
          return false
        }
        let currentIndex = navItems.findIndex((it: any) => it.key === page.key)
        if (currentIndex < 0) return false
        if (currentIndex > 0) currentIndex--
        let currentPage = navItems[currentIndex]
        if (page.refererKey) {
          const refererPage = navItems.find((item: any) => item.key === page.refererKey)
          if (refererPage) currentPage = refererPage
        }
        // 存在当前页，并且菜单项大于1
        if (currentPage && navItems.length > 1) {
          this.removeVisited(page)
          await router.goto({ name: currentPage.name, query: currentPage.query })
        } else {
          this.removeVisited(page)
          await router.goHome()
        }

        return true
      },

      removeVisitedOthers(page: PageInfoData) {
        const router = app.router
        const { appStore } = app.stores

        if (!router) return

        const submodule = page?.submodule || appStore.navMenu?.submodule

        const datas = this.datas || {}

        const visitedArr: PageInfo[] = []
        const pageDatas: any = {}

        for (const v of this.visited) {
          if (v.submodule === submodule && !isSamePage(v, page) && v.closeable !== false) {
            pruneCachedPage(router, page)
          } else {
            visitedArr.push(v)
            if (datas[v.key]) pageDatas[v.key] = datas[v.key]
          }
        }

        this.visited = visitedArr
        this.datas = pageDatas
      },

      pruneVisited(submodule: string) {
        const router = app.router

        if (!router) return

        const datas = this.datas || {}

        const visitedArr = []
        const pageDatas: any = {}

        if (submodule !== 'ALL') {
          for (const v of this.visited) {
            // 不可关闭的
            if (v.submodule === submodule || v.closeable !== false) {
              pruneCachedPage(router, v)
            } else {
              visitedArr.push(v)
              if (datas[v.key]) pageDatas[v.key] = datas[v.key]
            }
          }
        }

        this.visited = visitedArr
        this.datas = pageDatas
      },

      async pruneCurrentVisited(payload = { redirect: true }) {
        const router = app.router
        const { appStore } = app.stores

        if (!router) return
        const submodule = payload?.submodule || appStore.navMenu?.submodule
        this.pruneVisited(submodule)
        if (payload?.redirect !== false) await router.goHome()
      },

      // 新增临时页面
      addTemp(menu: NavMenuItem) {
        const { appStore } = app.stores
        const router = app.router
        if (!router) return

        let submodule = appStore.submodule
        if (menu.submodule) {
          submodule = appStore.submodules.find(it => it.name === menu.submodule)
        }

        if (!submodule) throw new Error('无法获取当前子模块，请检查当前模块是否加载成功')

        const tmpRoute = createTmpRoute(router, menu, submodule)
        return tmpRoute
      },

      /** 移除临时页面 */
      async removeTemp(page: PageInfoData) {
        const flag = await this.removeCurrentVisited(page)

        if (flag && page.name) {
          this.router.removeRoute(page.name)
        }
      },

      // 设置页面数据
      setPageData(pageKey: string, payload: SetDataOptions) {
        const datas = this.datas || {}

        const { type } = payload || {}
        const pageDatas: any = { ...datas }

        const pageData = setData(datas[pageKey], payload)

        if (type === 'clear') {
          pageDatas[pageKey] = undefined
          delete pageDatas[pageKey]
        } else {
          pageDatas[pageKey] = reactive<any>(pageData || {})
        }

        this.datas = pageDatas
      },

      // 获取页面数据
      getPageData(pageKey: string, path?: string) {
        if (!pageKey) return
        const datas = this.datas || {}

        if (!path) return datas[pageKey]
        return _.get(datas[pageKey], path)
      },

      setCurrentPageData(payload: SetDataOptions) {
        const router = app.router
        if (!router) return

        const pageKey = payload.pageKey || router.getCurrentPageKey()
        if (!pageKey) return

        this.setPageData(pageKey, { ...payload })
      },

      getCurrentPageData(path?: string) {
        const router = app.router
        if (!router) return

        const pageKey = router.getCurrentPageKey()
        if (!pageKey) return

        return this.getPageData(pageKey, path)
      }
    }
  })
}

/** 判断两个路由是否相同（name, query都相同） */
export function isSamePage(p1: PageInfoData, p2: PageInfoData) {
  if (!p1 || !p2) return false
  return p1.key === p2.key
}

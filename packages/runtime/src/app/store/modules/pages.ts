import { _ } from '../../../utils'
import { pruneCachedPage, createTmpRoute } from '../../router/util'
import { App } from '../../App'

import type { ActionTree, GetterTree, MutationTree } from 'vuex'
import type { NavMenuItem } from '../../../typings'
import type { PagesState, RootState, PageInfo } from '../../../typings/store'

// 页面状态
const state: PagesState = {
  datas: {}, // 页面数据
  current: '',
  defaults: [],
  visited: []
}

const getters: GetterTree<PagesState, RootState> = {
  current: () => state.current,
  visited: () => state.visited
}

const mutations: MutationTree<PagesState> = {
  // 设置当前页面
  setCurrent: (state, pageKey: string) => {
    state.current = pageKey
  },

  // 设置默认页面
  setDefaults: (state, pages: PageInfo[]) => {
    state.defaults = pages
  },

  // 新增已访问页面
  addVisited: (state, page: PageInfo) => {
    if (!page.pageKey || page.noCache) return
    if (!page.key) page.key = page.pageKey

    // 已存在于visited的 如果是详情页，详情id也存在的。不添加
    if (state.visited.some(v => isSamePage(v, page))) return

    const newPage: PageInfo = _.deepClone(page)

    // 标签刷新记住位置
    let index = 0

    const refererKey = page.refererKey

    // 打开详情时放在最新主页面后
    if (refererKey) {
      index = state.visited.findIndex(item => item.key === refererKey) + 1
    } else {
      index = state.visited.length
    }

    if (newPage.default === true) {
      state.visited = [newPage, ...state.visited]
    } else {
      state.visited.splice(index, 0, newPage)
      state.visited = [...state.visited]
    }
  },

  // 删除已访问过的页面
  removeVisited: (state, page: PageInfo) => {
    const router = App.instance?.router
    if (!router) return

    const datas = state.datas || {}

    const visitedArr: PageInfo[] = []
    const pageDatas: any = {}

    for (const [i, v] of state.visited.entries()) {
      if (isSamePage(v, page) && page.closeable !== false) {
        pruneCachedPage(router, page)
      } else {
        visitedArr.push(v)
        if (datas[v.key]) pageDatas[v.key] = datas[v.key]
      }
    }

    state.visited = visitedArr
    state.datas = pageDatas
  },

  removeVisitedOthers: (state, payload: { submodule: string; page: PageInfo }) => {
    const router = App.instance?.router
    if (!router) return

    const { submodule, page } = payload
    const datas = state.datas || {}

    const visitedArr: PageInfo[] = []
    const pageDatas: any = {}

    for (const v of state.visited) {
      if (v.submodule === submodule && !isSamePage(v, page) && v.closeable !== false) {
        pruneCachedPage(router, page)
      } else {
        visitedArr.push(v)
        if (datas[v.key]) pageDatas[v.key] = datas[v.key]
      }
    }

    state.visited = visitedArr
    state.datas = pageDatas
  },

  pruneVisited: (state, submodule: string) => {
    const router = App.instance?.router
    if (!router) return

    const datas = state.datas || {}

    const visitedArr = []
    const pageDatas: any = {}

    if (submodule !== 'ALL') {
      for (const v of state.visited) {
        // 不可关闭的
        if (v.submodule === submodule || v.closeable !== false) {
          pruneCachedPage(router, v)
        } else {
          visitedArr.push(v)
          if (datas[v.key]) pageDatas[v.key] = datas[v.key]
        }
      }
    }

    state.visited = visitedArr
    state.datas = pageDatas
  },

  setPageData: (state, payload: any) => {
    const datas = state.datas || {}

    const { pageKey, path, data, type } = payload || {}
    const pageDatas: any = { ...datas }

    let pageData = datas[pageKey] || {}

    if (!type || type === 'set') {
      if (!path) {
        pageData = data
      } else {
        _.set(pageData, path, data)
      }
    } else if (type === 'merge') {
      pageData = Object.assign(pageData, data)
    } else if (type === 'deepMerge') {
      pageData = _.deepMerge(pageData, data)
    }

    if (type !== 'delete') {
      pageDatas[pageKey] = pageData
    } else {
      pageDatas[pageKey] = undefined
      delete pageDatas[pageKey]
    }

    state.datas = pageDatas
  }
}

const actions: ActionTree<PagesState, RootState> = {
  setCurrent({ commit }, pageKey: string) {
    commit('setCurrent', pageKey)
  },

  async setDefaults({ commit, dispatch }, pages: PageInfo[]) {
    commit('setDefaults', pages)
    const promises = pages.map(it => dispatch('addVisited', it))
    await Promise.all(promises)
  },

  async addVisited({ commit }, route: any) {
    const router = App.instance?.router
    if (!router) return

    const page = route?.meta

    if (!page?.pageKey || page.noCache) return
    if (!page.key) page.key = page.pageKey

    // 已存在于visited的 如果是详情页，详情id也存在的。不添加
    if (state.visited.some(v => isSamePage(v, page))) return

    commit('addVisited', page)
    await router.goto({ name: page.name, query: page.query })
  },

  async removeVisited({ commit, rootGetters }, page: PageInfo) {
    const router = App.instance?.router
    if (!router) return

    const navItems = rootGetters.navPages

    let currentIndex = navItems.findIndex((it: any) => it.key === page.key)

    commit('removeVisited', page)

    if (navItems.length === 0) {
      await router.goHome()
      return
    }

    if (currentIndex <= 0) {
      currentIndex = 0
    } else {
      currentIndex--
    }

    let currentPage = navItems[currentIndex]
    if (page.refererKey) {
      const refererPage = navItems.find((item: any) => item.key === page.refererKey)
      if (refererPage) currentPage = refererPage
    }

    if (currentPage) {
      await router.goto({ name: currentPage.name, query: currentPage.query })
    } else {
      await router.goHome()
    }
  },

  async removeVisitedOthers({ commit, rootGetters }, page: PageInfo) {
    const submodule = rootGetters.navMenu?.submodule
    commit('removeVisitedOthers', {
      submodule,
      page
    })
  },

  async pruneVisited({ commit, rootGetters }, submodule?: string) {
    const router = App.instance?.router
    if (!router) return

    submodule = submodule || rootGetters.navMenu?.submodule
    commit('pruneVisited', submodule)
    await router.goHome()
  },

  // 新增临时页面
  async addTemp({ rootGetters }, menu: NavMenuItem) {
    const router = App.instance?.router
    if (!router) return

    const submodule = rootGetters['app/submodule']
    const tmpRoute = createTmpRoute(router, menu, submodule)
    return tmpRoute
  },

  setPageData: ({ commit }, payload: any) => {
    const router = App.instance?.router
    if (!router) return

    let pageKey = payload.pageKey

    if (!pageKey) {
      const route = router.currentRoute

      if (route.value?.meta?.pageKey) {
        pageKey = route.value?.meta?.pageKey
      }
    }

    if (!pageKey) return

    commit('setPageData', { ...payload, pageKey })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

/** 判断两个路由是否相同（name, query都相同） */
function isSamePage(p1: PageInfo, p2: PageInfo) {
  if (!p1 || !p2) return false
  return p1.key === p2.key
}

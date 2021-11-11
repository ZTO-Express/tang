import { useRouter } from '../../router'
import { useAuthLoader } from '../../loaders'

import type { ActionTree, GetterTree, MutationTree } from 'vuex'
import type { NavMenuItem, Submodule } from '../../typings'
import type { AppState, RootState } from '../../typings/store'

// 应用状态
const state: AppState = {
  loaded: false,
  appId: '',
  submodules: [],
  navMenu: {
    submodule: '',
    menus: [],
    current: '',
    collapsed: false
  },
  error: null
}

const getters: GetterTree<AppState, RootState> = {
  submodule: () => _getSubmodule(state.navMenu.submodule)
}

const mutations: MutationTree<AppState> = {
  // 设置应用信息
  setAppInfo(state, payload: any) {
    const submodules: Submodule[] = payload.submodules || []

    // 顶级菜单作为子模块
    submodules.forEach(it => (it.isSubmodule = true))

    state.submodules = submodules

    // 设置默认子模块
    _setSubmodule(state, {
      name: payload.default
    })
  },

  // 设置导航菜单
  setNavMenu(state, payload: any) {
    _setSubmodule(state, payload)
  },

  // 设置app states
  setAppStates(state, payload: any) {
    const pStates = payload
    if (pStates) {
      for (let key in pStates) {
        state[key] = pStates[key]
      }
    }
  }
}

const actions: ActionTree<AppState, RootState> = {
  // 加载应用基本信息
  load: async context => {
    const { commit, dispatch, getters, rootState } = context

    // 1. 加载用户信息
    await dispatch('user/getUserInfo', {}, { root: true })

    // 2. 设置应用信息
    const authLoader = useAuthLoader()

    if (authLoader) {
      const userInfo = await authLoader.getUserInfo()
      commit('user/setUserInfo', userInfo, { root: true })

      let submodules: NavMenuItem[] = []
      if (authLoader?.getMenuData) submodules = await authLoader.getMenuData()
      commit('setAppInfo', { submodules })
    }
  },

  // 切换子模块
  changeSubmodule: async ({ commit, state, getters }, payload: any) => {
    const router = useRouter()

    const navMenu = state.navMenu

    // 若子模块与当前子模块相同，则不作任何操作
    if (payload.name === navMenu.submodule) return
    commit('setNavMenu', payload)

    const submodule = getters.submodule

    if (submodule.meta?.hidden) return

    if (payload.to) {
      await router.goto(payload.to)
    } else if (submodule.defaultMenu?.name) {
      await router.goto({ name: submodule.defaultMenu?.name })
    } else {
      await router.goHome()
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

// 获取指定的子模块
function _getSubmodule(name?: string) {
  const submodules = state.submodules.filter(it => !it.meta?.hidden)

  let submodule: Submodule | undefined = submodules[0]
  if (name) submodule = submodules.find(it => it.name === name)

  return submodule
}

// 设置档期的子模块
function _setSubmodule(state: AppState, payload: any) {
  let submodule: Submodule | undefined = _getSubmodule(payload?.name)

  const navMenu = {
    submodule: '',
    current: '',
    collapsed: false,
    menus: [] as NavMenuItem[]
  }

  if (submodule) {
    navMenu.submodule = submodule.name
    navMenu.menus = submodule.children || []
  }

  state.navMenu = navMenu
}

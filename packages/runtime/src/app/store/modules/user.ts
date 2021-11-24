import { useAuthLoader } from '../../loaders'

import type { ActionTree, MutationTree } from 'vuex'
import type { RootState, UserState } from '../../../typings/store'

// 用户状态
const state: UserState = {
  logged: false,
  userId: '',
  mobile: '',
  avatar: '',
  username: '',
  nickname: '',
  menus: [],
  roles: [],
  permissions: []
}

const mutations: MutationTree<UserState> = {
  setUserInfo: (state, payload: any) => {
    state.logged = !!payload.username

    state.username = payload.username
    state.avatar = payload.avatar
    state.nickname = payload.nickname
    state.mobile = payload.mobile

    state.roles = payload.roles
    state.menus = payload.menus
    state.permissions = payload.permissions

    const pStates = payload.states
    if (pStates) {
      for (const key in pStates) {
        state[key] = pStates[key]
      }
    }
  },

  // 设置user states
  setUserStates(state, payload: any) {
    const pStates = payload
    if (pStates) {
      for (const key in pStates) {
        state[key] = pStates[key]
      }
    }
  }
}

const actions: ActionTree<UserState, RootState> = {
  // 获取用户信息
  async getUserInfo({ commit }, payload: Record<string, any>) {
    const authLoader = useAuthLoader()

    if (authLoader) {
      const res = await authLoader.getUserInfo(payload)

      // 设置用户信息
      commit('setUserInfo', res)
    }
  },

  // 登出
  async logout() {
    const authLoader = useAuthLoader()
    if (authLoader) authLoader.logout()
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

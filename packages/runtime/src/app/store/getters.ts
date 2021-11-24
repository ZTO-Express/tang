import type { GetterTree } from 'vuex'
import type { RootState } from '../../typings/store'

export const getters: GetterTree<RootState, RootState> = {
  app: (state) => state.app,
  submodules: (state) => {
    return (state.app.submodules || []).filter((it) => !it.meta?.hidden)
  },
  navMenu: (state) => state.app.navMenu,

  pages: (state) => state.pages,
  page: (state) => {
    const pageKey = state.pages.current
    const pageData = state.pages.datas[pageKey] || {}

    return {
      key: pageKey,
      data: pageData
    }
  },
  visitedPages: (state) => state.pages.visited,
  navPages: (state) => {
    const visited = state.pages.visited
    const submodule = state.app.navMenu?.submodule

    const items = visited.filter((it: any) => {
      return !submodule || !it.submodule || it.submodule === submodule
    })

    return items
  },

  user: (state) => state.user,
  username: (state) => state.user.username,
  nickname: (state) => state.user.nickname,
  userAvatar: (state) => state.user.avatar,
  userRoles: (state) => state.user.roles,
  permissions: (state) => state.user.permissions
}

import { AppLoaderType } from '../../../consts'

import type { AppAuthLoader, NavMenuItem } from '../../../typings'
import type { App } from '../../App'

export const LocalAuthLoader: AppAuthLoader = {
  type: AppLoaderType.AUTH,

  name: 'local',

  async checkAuth(app: App) {
    const router = app.router
    const { authApi } = app.apis

    if (authApi.checkAuth) {
      await authApi.checkAuth(app.config)
    } else {
      // 从url获取code
      const searchParams = new URL(window.location.href).searchParams
      let token: any = searchParams.get('token')
      if (!token && router?.currentRoute) {
        token = router?.currentRoute.value?.query?.token
      }

      if (token) await app.token.refresh(token)
    }
  },

  // 获取用户信息
  async getUserInfo(app: App) {
    const { authApi } = app.apis
    // 先重设token
    await app.token.reset()

    const res = await authApi.getUserInfo!()

    return res
  },

  // 解析菜单数据
  async getMenuData(app: App) {
    const menus: NavMenuItem[] = app.stores.userStore.menus || []
    return menus
  },

  async logout(app: App) {
    const { authApi } = app.apis

    if (authApi.logout) {
      authApi.logout()
    } else {
      await app.token.clearData()
    }
  }
}

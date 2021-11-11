import { resetToken, refreshToken, clearTokenData } from '../../utils'
import { useApi } from '../../config'
import { useStore } from '../../store'
import { useRouter } from '../../router'
import type { AppAuthLoader, NavMenuItem } from '../../typings'

export const LocalAuthLoader: AppAuthLoader = {
  name: 'local',

  async checkAuth(config: any) {
    const router = useRouter()

    const userApi = useApi('user')

    if (userApi.checkAuth) {
      await userApi.checkAuth(config)
    } else {
      // 从url获取code
      const searchParams = new URL(window.location.href).searchParams
      let token: any = searchParams.get('token')
      if (!token && router?.currentRoute) {
        token = router?.currentRoute.value?.query?.token
      }

      if (token) await refreshToken(token)
    }
  },

  // 获取用户信息
  async getUserInfo() {
    const userApi = useApi('user')

    // 先重设token
    await resetToken()

    const res = await userApi.getUserInfo()

    return res
  },

  // 解析菜单数据
  async getMenuData() {
    const store = useStore()
    const menus: NavMenuItem[] = store.getters.user?.menus || []
    return menus
  },

  async logout() {
    const userApi = useApi('user')
    if (userApi.logout) {
      userApi.logout()
    } else {
      await clearTokenData()
    }
  }
}

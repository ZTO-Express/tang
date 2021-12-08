import { clearTokenData, refreshToken, getAccessToken, resetToken, uniqId, _, reloadUrl } from '../../../utils'
import { useApi, useEnv } from '../../../config'
import { useAppStore } from '../../store'

import type { AppAuthLoader, NavMenuItem } from '../../../typings'

/** iam菜单项 */
interface IAMMenuItem {
  menuId: string // 菜单id
  parentMenuId: number // 父级菜单id
  menuName: string // 菜单名称（标题）
  keyName: string // 菜单编号
  icon: string // 菜单图标
  name: string // 权限名称
  path: string // 菜单链接
  ordinal: number // 排序号
  children?: IAMMenuItem[] // 子菜单

  [prop: string]: any
}

export const IAMAuthLoader: AppAuthLoader = {
  name: 'iam',

  // 检查用户权限
  async checkAuth() {
    // 从url获取code
    const searchParams = new URL(window.location.href).searchParams
    const code = searchParams.get('code')

    try {
      // 刷新token
      if (code) {
        // 刷新并设置token
        await refreshToken(code)
      } else {
        // 重设token
        await resetToken()
      }

      if (!getAccessToken()) {
        await IAMAuthLoader.logout()
      } else if (code) {
        reloadUrl()
      }
    } catch (ex) {
      await IAMAuthLoader.logout()
    }
  },

  // 获取用户信息
  async getUserInfo() {
    const userApi = useApi('user')
    const res = await userApi.getUserInfo()

    return res
  },

  // 解析菜单数据
  async getMenuData() {
    const store = useAppStore()

    const menus = store.getters.user?.menus || []

    const navMenus = menus.map((it: any) => {
      return parseMenuItem(it)
    })

    return navMenus
  },

  async logout() {
    const ENV = useEnv()
    const userApi = useApi('user')

    if (userApi.logout) {
      await userApi.logout()
    } else {
      await clearTokenData()

      const redirectUrl = encodeURIComponent(window.location.origin)
      const loginUrl = `${ENV.iamUrl}/oauth2?app_id=${ENV.appId}&redirect_url=${redirectUrl}&state=${uniqId()}`
      window.location.href = loginUrl
    }
  }
}

// 解析单项菜单
function parseMenuItem(menu: IAMMenuItem): NavMenuItem {
  const children = (menu.children || []).map((it) => {
    it.parentName = menu.keyName
    return parseMenuItem(it)
  })

  // 原始菜单数据(忽略children项)
  const data = _.omit(menu, ['children'])

  return {
    name: menu.keyName,
    parentName: menu.parentName,
    title: menu.menuName,
    icon: menu.icon,
    path: menu.path,
    order: menu.ordinal || 0,
    data,
    children
  }
}

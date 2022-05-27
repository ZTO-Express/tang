import { _ } from '../../../utils'
import { STORE_NAME } from '../../../consts'
import { App } from '../../App'
import { defineStore } from '../util'

import type { UserState, UserGetters, UserActions } from '../../../typings'

export function defineUserStore(app: App) {
  const appName = app.name

  return defineStore<UserState, UserGetters, UserActions>(STORE_NAME.USER, {
    appName,

    state: () => {
      return {
        logged: false,
        userId: '',
        mobile: '',
        avatar: '',
        username: '',
        nickname: '',
        menus: [],
        roles: [],
        permissions: [],
        data: {}
      }
    },

    actions: {
      /** 设置用户信息 */
      set(payload: Record<string, any>) {
        if (!payload) return

        this.$patch({
          logged: !!payload.username,

          username: payload.username,
          avatar: payload.avatar,
          nickname: payload.nickname,
          mobile: payload.mobile,

          roles: payload.roles,
          menus: payload.menus,
          permissions: payload.permissions
        })

        this.setData(payload.data)
      },

      // 设置user 数据
      setData(payload: Record<string, any>) {
        if (!payload) return

        this.$patch(state => {
          const pData = payload

          if (_.isObject(pData)) {
            const sData = { ...state.data }

            for (const key in pData) {
              sData[key] = pData[key]
            }
            state.data = sData
          }
        })
      },

      async load(payload: Record<string, any>) {
        const authLoader = app.useAuthLoader()

        if (authLoader) {
          const res = await authLoader.getUserInfo(app, payload)

          this.set(res)
        }
      }
    }
  })
}

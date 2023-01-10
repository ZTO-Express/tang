/** 资源管理相关Api */

import { _, AppAuthApi, App, defineAppApi } from '@zto/zpage'

export default defineAppApi<AppAuthApi>((app: App) => {
  return {
    baseUrl: app.env.apiUrl,

    methods: api => {
      return {
        /** 获取用户信息 */
        async getUserInfo() {
          return {
            nickname: '匿名',
            username: 'anonymous'
          }
        },

        /**
         * 检查用户权限
         * @param code 权限编码
         */
        checkPermission(codes: string | string[]) {
          if (!codes) return true

          codes = Array.isArray(codes) ? codes : [codes]

          const permissions = app.stores.userStore.permissions || []

          const flag = codes.some(code => permissions.includes(code))
          return flag
        }
      }
    }
  }
})

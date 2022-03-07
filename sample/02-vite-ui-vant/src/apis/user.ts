/** 资源管理相关Api */

import { clearTokenData, HttpRequest } from '@zto/zpage'
import { ENV } from '../config/env'
import { httpConfig } from '../config/http'

const request = new HttpRequest(ENV.apiUrl, httpConfig)

export default new (class extends HttpRequest {
  /** 获取token */
  async getToken(code: string) {
    return request.fetch({
      url: 'tuxi.base.UserService.getToken',
      data: { code }
    })
  }

  /** 刷新token */
  async exchangeToken(refreshToken: string) {
    return request.fetch({
      url: 'tuxi.base.UserService.exChangeToken',
      data: { refresh_token: refreshToken }
    })
  }

  /** 获取用户信息 */
  async getUserInfo() {
    const getBasicInfo = request.post('user.login.info')

    const results = await Promise.all([getBasicInfo])

    const basic = results[0] as any
    const userInfo = results[1] as any

    return {
      ...results[1],

      // 附加states
      states: {
        unionId: userInfo.union_id,
        basic
      }
    }
  }

  /** 登出系统 */
  async logout() {
    await clearTokenData()
  }
})()

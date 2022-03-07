import { HttpRequest } from '@zto/zpage-ui-element'
import { ENV } from '../config/env'
import { httpConfig } from '../config/http'

export default new (class extends HttpRequest {
  constructor() {
    super(ENV.apiUrl, httpConfig)
  }

  /** 获取用户信息 */
  async getUserInfo() {
    return { username: '', nickname: '匿名用户' }
  }
})()

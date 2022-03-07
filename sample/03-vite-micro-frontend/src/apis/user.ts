import { ENV } from '../config/env'
import { httpConfig } from '../config/http'

const { HttpRequest } = ZPage

export default new (class extends HttpRequest {
  constructor() {
    super(ENV.apiUrl, httpConfig)
  }

  /** 获取用户信息 */
  async getUserInfo() {
    return { username: '', nickname: '匿名用户' }
  }
})()

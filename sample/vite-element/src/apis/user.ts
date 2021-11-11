/** 资源管理相关Api */
import { HttpRequest } from 'zpage'
import { ENV } from '../config/env'
import { httpConfig } from '../config/http'

import type { UserApi } from 'zpage'

export default new (class extends HttpRequest implements UserApi {
  constructor() {
    super(ENV.apiUrl, httpConfig)
  }

  /** 获取用户信息 */
  async getUserInfo() {
    return { username: '', nickname: '匿名用户' }
  }
})()

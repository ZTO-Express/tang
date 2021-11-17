/** 资源管理相关Api */
import { HttpRequest } from '@zpage/zpage'
import { ENV } from '../config/env'
import { httpConfig } from '../config/http'

import type { AppUserApi } from '@zpage/zpage'

export default {
  /** 获取用户信息 */
  async getUserInfo() {
    return { username: '', nickname: '匿名用户' }
  }
}

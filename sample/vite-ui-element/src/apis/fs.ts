/** 资源管理相关Api */
import { HttpRequest } from '@zpage/zpage'
import { ENV } from '../config/env'
import { httpConfig } from '../config/http'

export default new (class extends HttpRequest {
  constructor() {
    super(ENV.apiUrl, httpConfig)
  }
})()

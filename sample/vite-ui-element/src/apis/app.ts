import { HttpRequest } from '@zpage/ui-element'
import { ENV } from '../config/env'
import { httpConfig } from '../config/http'

export default new (class extends HttpRequest {
  constructor() {
    super(ENV.apiUrl, httpConfig)
  }

  async getAppList() {
    return super.get('apps')
  }
})()

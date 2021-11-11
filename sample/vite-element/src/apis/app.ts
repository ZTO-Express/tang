import { HttpRequest } from 'zpage'
import { ENV } from '../config/env'
import { httpConfig } from '../config/http'

export default new (class extends HttpRequest {
  constructor() {
    super(ENV.apiUrl, httpConfig)
  }

  async getAppList() {
    return this.get('apps')
  }
})()

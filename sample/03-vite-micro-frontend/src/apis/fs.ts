import { ENV } from '../config/env'
import { httpConfig } from '../config/http'

const { HttpRequest } = ZPage

export default new (class extends HttpRequest {
  constructor() {
    super(ENV.apiUrl, httpConfig)
  }
})()

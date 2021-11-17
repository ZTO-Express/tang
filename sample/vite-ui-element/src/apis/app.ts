import { HttpRequest } from '@zpage/ui-element'
import { ENV } from '../config/env'
import { httpConfig } from '../config/http'

const request: any = new HttpRequest(ENV.apiUrl, httpConfig)

request.getAppList = async () => {
  return request.get('apps')
}

export default request

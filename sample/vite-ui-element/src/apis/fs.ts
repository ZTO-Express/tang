/** 资源管理相关Api */
import { HttpRequest } from '@zpage/ui-element'
import { ENV } from '../config/env'
import { httpConfig } from '../config/http'

const request: any = new HttpRequest(ENV.apiUrl, httpConfig)

export default request

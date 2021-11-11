import { ElMessageBox as MessageBox } from 'element-plus'
import { ZFfb } from '@zpage/ffb'
import { user as userApi } from '../apis'

import { ENV } from './env'
import ffb from './ffb'

import type { HttpRequestConfig } from '@zpage/zpage'

ZFfb.use(ffb)

function beforeRequest(config: any) {
  /** 对请求进行拦截调整 */
  ZFfb.interceptFfbRequest(config)

  return config
}

function requestError(error: any) {
  return Promise.reject(error)
}

function afterResponse(response: any) {
  /** 对请求进行拦截调整 */
  ZFfb.interceptFfbResponse(response)

  const cfg = response.config
  const res = response.data

  if (ENV.env === 'mock') res.status = true
  if (cfg.responseType === 'blob') return response
  // 忽略错误
  // if (res.status) return res.result
  return res.result

  // token过期或不存在
  if (['401', '403'].includes(res.statusCode)) {
    // 跳转登录页
    // userApi.logout()
    return Promise.reject(res)
  }

  MessageBox.close()

  MessageBox.confirm(res.message, '错误提示', {
    showCancelButton: false,
    type: 'error'
  })

  return Promise.reject(res.message || 'error')
}

function responseError(error: any) {
  MessageBox.close()

  MessageBox.confirm('网络开小差了，请稍后重试～', '提示', {
    showCancelButton: false,
    type: 'error'
  })

  return Promise.reject(error)
}

export const httpConfig: HttpRequestConfig = {
  interceptors: {
    beforeRequest,
    requestError,
    afterResponse,
    responseError
  }
}

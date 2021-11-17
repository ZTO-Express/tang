import { Toast } from 'vant'
import { uuid, getAccessToken, useAppRouter, ZFfb } from '@zpage/zpage'

import ffb from '../config/ffb'
import { ENV } from './env'

import type { HttpRequestConfig } from '@zpage/zpage'

ZFfb.use(ffb)

function beforeRequest(config: any) {
  const router = useAppRouter()

  /** 对请求进行拦截调整 */
  ZFfb.interceptFfbRequest(config)

  config.headers['x-zop-ns'] = 'tuxi-cdc'
  config.headers['x-request-id'] = uuid()

  let token: any = getAccessToken()
  if (!token) {
    const searchParams = new URL(window.location.href).searchParams
    token = searchParams.get('token')
  }
  if (!token && router.currentRoute?.value?.query?.token) {
    token = router.currentRoute.value?.query?.token
  }

  config.headers['x-iam-token'] = token

  return config
}

function requestError(error: any) {
  return Promise.reject(error)
}

async function afterResponse(response: any) {
  /** 对请求进行拦截调整 */
  ZFfb.interceptFfbResponse(response)

  const cfg = response.config
  const res = response.data

  if (ENV.env === 'mock') res.status = true
  if (cfg.responseType === 'blob') return response
  if (res.status) return res.result

  Toast.clear()
  Toast.fail(res.message)

  return Promise.reject(res.message || 'error')
}

function responseError(error: any) {
  Toast.clear()
  Toast.fail('网络开小差了，请稍后重试～')

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

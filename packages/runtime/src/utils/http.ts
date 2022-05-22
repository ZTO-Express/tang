import axios from 'axios'
import { ZFfb } from '@zto/zpage-ffb'

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { GenericFunction } from '@zto/zpage-core'
import type { FfbProcessor } from '@zto/zpage-ffb'

// 请求选项
export interface HttpRequestOptions extends AxiosRequestConfig {
  reqCode?: string
  reqLimit?: number
  isSocket?: boolean
  isBuffer?: boolean
  isSilent?: boolean
}

// 请求错误
export interface HttpRequestError {
  name?: string
  code?: number
  message?: string

  [prop: string]: any
}

export interface HttpRequestConfig {
  baseUrl?: string

  ffbs?: Record<string, FfbProcessor>

  interceptors?: {
    beforeRequest?: (config: AxiosRequestConfig) => Promise<any> | GenericFunction
    requestError?: (error: any, config?: HttpRequestConfig) => Promise<any> | GenericFunction
    afterResponse?: (response: AxiosResponse, config?: HttpRequestConfig) => Promise<any> | GenericFunction
    responseError?: (error: any, config?: HttpRequestConfig) => Promise<any> | GenericFunction
    afterFetchResponse?: (response: AxiosResponse, config?: HttpRequestConfig) => Promise<any> | GenericFunction
  }
}

/**
 * Http请求类
 */
export class HttpRequest {
  private _queue: Record<string, boolean>
  protected _baseUrl: string | undefined
  protected _config: HttpRequestConfig | undefined
  protected _ffb: ZFfb

  constructor(baseUrl?: string, config?: HttpRequestConfig) {
    this._queue = {}
    this._baseUrl = baseUrl
    this._config = config
    this._ffb = new ZFfb(config?.ffbs)
  }

  // 发起get请求
  async get<T = any>(url: string, params?: any, options: HttpRequestOptions = {}) {
    return this.fetch<T>({ ...options, url, method: 'GET', params })
  }

  // 发起post请求
  async post<T = any>(url: string, data?: any, options: HttpRequestOptions = {}) {
    return this.fetch<T>({ ...options, url, method: 'POST', data })
  }

  // 发起请求
  async fetch<T = any>(options: HttpRequestOptions) {
    const instance = axios.create()
    const config = Object.assign(this.getInnerConfig(), options)
    if (options.isBuffer) config.responseType = 'blob'

    this.interceptors(instance, options.url)
    const response = await instance.request(config)

    const afterFetchResponse = this._config?.interceptors?.afterFetchResponse

    if (afterFetchResponse) return afterFetchResponse(response)

    return response.data as T
  }

  destroy(url: string) {
    delete this._queue[url]
  }

  private getInnerConfig() {
    const config = {
      baseURL: this._baseUrl,
      withCredentials: true,
      method: 'POST',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return config
  }

  private interceptors(instance: AxiosInstance, url?: string) {
    // 请求拦截
    instance.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        let _config = config

        let cfg = await Promise.resolve().then(() => this._ffb.interceptFfbRequest(config))
        if (cfg) _config = cfg

        const beforeRequest = this._config?.interceptors?.beforeRequest
        if (beforeRequest) {
          cfg = await Promise.resolve().then(() => beforeRequest(cfg))
          if (cfg) _config = cfg
        }

        return _config
      },
      error => {
        const requestError = this._config?.interceptors?.requestError
        if (requestError) return Promise.resolve().then(() => requestError(error))
        return Promise.reject(error)
      }
    )

    // 响应拦截
    instance.interceptors.response.use(
      async (response: AxiosResponse) => {
        if (url) this.destroy(url)

        let _response = response

        let resp = await Promise.resolve().then(() => this._ffb.interceptFfbResponse(response))
        if (resp) _response = resp

        const afterResponse = this._config?.interceptors?.afterResponse
        if (afterResponse) resp = await Promise.resolve().then(() => afterResponse(resp))
        if (resp) _response = resp

        return _response
      },
      error => {
        if (url) this.destroy(url)

        const responseError = this._config?.interceptors?.responseError
        if (responseError)
          return Promise.resolve().then(() => {
            return responseError(error)
          })

        const errorData = error && error.response
        return Promise.reject(errorData)
      }
    )
  }
}

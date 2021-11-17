import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { GenericFunction } from '@zpage/core'

// 请求选项
export interface HttpRequestOptions extends AxiosRequestConfig {
  reqCode?: string
  reqLimit?: number
  isSocket?: boolean
  isBuffer?: false
}

// 请求错误
export interface HttpRequestError {
  name?: string
  code?: number
  message?: string

  [prop: string]: any
}

export interface HttpRequestConfig {
  interceptors?: {
    beforeRequest?: (config: AxiosRequestConfig) => Promise<any> | GenericFunction
    requestError?: (error: any) => Promise<any> | GenericFunction
    afterResponse?: (response: AxiosResponse) => Promise<any> | GenericFunction
    responseError?: (error: any) => Promise<any> | GenericFunction
  }

  [prop: string]: any
}

/**
 * Http请求类
 */
export class HttpRequest {
  private _queue: Record<string, boolean> = {}
  protected _baseUrl: string | undefined
  protected _config: HttpRequestConfig | undefined

  constructor(baseUrl?: string, config?: HttpRequestConfig) {
    this._baseUrl = baseUrl
    this._config = config
  }

  // 发起get请求
  async get(url: string, params?: any, options: HttpRequestOptions = {}) {
    return this.fetch({ ...options, url, method: 'GET', params })
  }

  // 发起post请求
  async post(url: string, data?: any, options: HttpRequestOptions = {}) {
    return this.fetch({ ...options, url, method: 'POST', data })
  }

  // 发起请求
  async fetch(options: HttpRequestOptions) {
    const instance = axios.create()
    const config = Object.assign(this.getInnerConfig(), options)
    if (options.isBuffer) config.responseType = 'blob'

    this.interceptors(instance, options.url)

    const res = await instance.request(config)
    return res
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
      (config: AxiosRequestConfig) => {
        if (url) this._queue[url] = true

        const beforeRequest = this._config?.interceptors?.beforeRequest
        if (beforeRequest) return Promise.resolve().then(() => beforeRequest(config))

        return config
      },
      error => {
        const requestError = this._config?.interceptors?.requestError
        if (requestError) return Promise.resolve().then(() => requestError(error))
        return Promise.reject(error)
      }
    )

    // 响应拦截
    instance.interceptors.response.use(
      (res: AxiosResponse) => {
        const data = res && res.data
        if (url) this.destroy(url)

        const afterResponse = this._config?.interceptors?.afterResponse
        if (afterResponse) return Promise.resolve().then(() => afterResponse(res))

        return data
      },
      error => {
        if (url) this.destroy(url)

        const responseError = this._config?.interceptors?.responseError
        if (responseError) return Promise.resolve().then(() => responseError(error))

        const errorData = error && error.response
        return Promise.reject(errorData)
      }
    )
  }
}

import type { Widget, Schema, Plugin, PromiseFunction, PromiseObject } from '@zto/zpage-core'
import type { VueApp, VueComponent } from './vue'

/** 运行时扩展选项 */
export interface RuntimeExtends {
  widgets?: Widget[] // 扩展微件
  plugins?: Plugin[] // 扩展插件
  [prop: string]: any
}

/** 应用配置 */
export interface RuntimeConfig {
  env?: Record<string, any>
  apis?: Record<string, any>
  widgets?: Record<string, any>
  components?: Record<string, any>
  [prop: string]: any
}

export interface RuntimeUI {
  install?: PromiseFunction

  [prop: string]: any
}

export interface Installable {
  vueApp: VueApp
  register: (widgets: VueComponent | VueComponent[]) => Promise<void>
  apply?: (plugins: Plugin | Plugin[], ...options: any[]) => Promise<void>
}

export interface InstallableOptions {
  widgets?: Widget[]
  components?: VueComponent[]
  extends?: RuntimeExtends
  [prop: string]: any
}

export interface TokenData {
  accessToken: string
  refreshToken?: string
  requestTime?: number

  [prop: string]: any
}

export type ApiRequestAction =
  | string
  | { type?: string; api: string; sourceType?: string; [prop: string]: any }

/** 请求参数 */
export interface ApiRequestConfig {
  action: ApiRequestAction
  params?: Record<string, any>

  [prop: string]: any
}

/** 请求参数 */
export interface ApiQueryRequestConfig extends ApiRequestConfig {
  pageIndex: number
  pageSize: number
}

/** 请求适配器 */
export type ApiRequest = (config: ApiRequestConfig) => Promise<any>

/** api查询适配器 */
export type ApiQueryRequest = (
  config: ApiQueryRequestConfig
) => Promise<{ rows: any; total: number; statistic: any }>

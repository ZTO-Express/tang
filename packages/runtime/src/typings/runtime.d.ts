import type {
  Widget,
  Schema,
  Loader,
  Plugin,
  PromiseFunction,
  PromiseObject,
  AppSchema,
  PageSchema
} from '@zto/zpage-core'
import type { VueApp, VueComponent } from './vue'
import type { TextFormatters } from './config'

/** option选项相关配置 */
export interface DataOptionItem {
  value: number | string | undefined
  label: string
  [prop: string]: any
}

export type DataOptionItems = Record<string, DataOptionItem[]>

// 格式化器
export type TextFormatter = (val: any, options?: any) => string
export type TextFormatters = Record<string, TextFormatter>

// 格式化选项
export interface FormatTextOptions {
  formatters?: TextFormatters
  [prop: string]: any
}

/** 运行时扩展选项 */
export interface RuntimeExtensions {
  widgets?: Widget[] // 扩展微件
  plugins?: Plugin[] // 扩展插件
  loaders?: Loader[] // 加载器
  [prop: string]: any
}

/** 运行时配置，这是更多起的是说明文档的功能 */
export interface RuntimeConfig {
  schema?: AppSchema // 运行时Schema
  api?: Record<string, any> // api相关选项
  apis?: Record<string, any> // 接入的api
  pages?: PageSchema[] // 接入的页面
  widgets?: Record<string, any> // 接入的微件配置
  components?: Record<string, any> // 接入的组件配置
  formatters?: TextFormatters // 格式化器配置
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
  env: Record<string, any>
  ui?: RuntimeUI
  config?: Record<string, any>
  extensions?: RuntimeExtensions
}

export interface TokenData {
  accessToken: string
  refreshToken?: string
  requestTime?: number

  [prop: string]: any
}

export type ApiRequestActionApi = string | { [prop: string]: any }

export interface ApiRequestAction {
  type?: string
  api?: ApiRequestActionApi
  url?: string
  sourceType?: string
  mockData?: any
  [prop: string]: any
}

/** 请求参数 */
export interface ApiRequestConfig {
  ns?: string // 命名空间
  url?: string // 请求地址
  api?: ApiRequestActionApi // api请求
  action?: string | ApiRequestAction // 动作请求
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
export type ApiQueryRequest = (config: ApiQueryRequestConfig) => Promise<{ rows: any; total: number; statistic: any }>

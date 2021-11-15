import type { Component } from 'vue'
import type {
  Router,
  RouteRecordRaw,
  NavigationGuardWithThis,
  NavigationHookAfter
} from 'vue-router'
import type {
  Widget,
  Plugin,
  AppStartOptions,
  AppConfig as CoreAppConfig,
  RuntimeConfig,
  PageSchema,
  AppSchema
} from '@zpage/core'

import type { TreeItem } from '../utils'
import type { AppStore } from './store'

/** 菜单选项 */
export interface NavMenuItem extends TreeItem<NavMenuItem> {
  name: string
  title: string
  order: number
  parentName?: string
  pageKey?: string
  icon?: string
  path?: string
  children?: NavMenuItem[]
  data?: any
}

/** 菜单配置，便于合并 */
export interface NavMenuItemConfig extends Partial<NavMenuItem> {
  name: string
  children?: NavMenuItemConfig[]
}

/** 应用子模块相关信息 */
export interface Submodule extends NavMenuItem {
  isSubmodule: true
  defaultMenu?: NavMenuItemConfig
}

export interface AppRouterConfig {
  router?: Router
  routes?: RouteRecordRaw[]
  beforeEach?: NavigationGuardWithThis<undefined>
  afterEach?: NavigationHookAfter
  beforeResolve?: NavigationGuardWithThis<undefined>
  onError?: (handler: _ErrorHandler) => void
}

export interface AppRuntimeConfig extends RuntimeConfig<Component> {
  router: Router
  store: AppStore
}

/** 应用配置 */
export interface AppConfig extends CoreAppConfig {
  env?: GenericObject
  apis?: GenericObject
  components?: GenericObject
}

export interface AppUI {
  root: Component
  theme: Component
  router?: AppRouterConfig
  install?: PromiseFunction

  [prop: string]: any
}

/** 应用选项 */
export interface AppOptions extends AppStartOptions<Component> {
  ui: AppUI
  config?: AppConfig
}

/**
 * App启动选项
 *  T 为框架组件类型（vue为Component）
 */
export interface NormalizedAppOptions extends Required<AppOptions> {
  schema: AppSchema
}

export interface AppRenderOptions {
  ui: AppUI
  config?: AppConfig
  [prop: string]: any
}

export interface AppRendererConfig {
  root: Component
  store: AppStore
  plugins?: Plugin[]
  widgets?: Widget[]
  [prop: string]: any
}

/**
 * 用户相关Api
 */
export interface UserApi {
  // 检查权限, 一般给auth loader用
  checkAuth?: (config: AppConfig) => PromiseObject

  // 获取接口调用token
  getToken?: (payload: any) => PromiseObject

  // 交换token
  exchangeToken?: (payload: any) => PromiseObject

  // 获取用户信息
  getUserInfo: () => PromiseObject

  // 登出系统
  logout?: () => PromiseObject
}

export interface TokenData {
  accessToken: string
  refreshToken?: string
  requestTime?: number

  [prop: string]: any
}

/** 请求参数 */
export interface ApiRequestConfig {
  action: { type?: string; api: string; sourceType?: string } | string
  params?: GenericObject

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

// 应用加载器
export interface AppLoader {
  name: string
}

// 权限加载器
export interface AppAuthLoader extends AppLoader {
  // 检查应用认证
  checkAuth: (config: AppConfig) => PromiseObject

  // 获取用户信息
  getUserInfo: () => Promise<any>

  // 解析获取的菜单数据
  getMenuData: () => Promise<NavMenuItem[]>

  // 登出
  logout: () => Promise<void>
}

// 页面加载器
export interface AppPageLoader extends AppLoader {
  loadPage: (path: string) => Promise<PageSchema | undefined>
}

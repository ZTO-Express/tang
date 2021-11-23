import type { VueComponent } from './vue'
import type {
  Router,
  RouteRecordRaw,
  NavigationGuardWithThis,
  NavigationHookAfter,
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded
} from 'vue-router'
import type {
  Widget,
  Plugin,
  Schema,
  PageSchema,
  PromiseFunction,
  PromiseObject
} from '@zto/zpage-core'

import type { InstallableOptions, RuntimeConfig, RuntimeUI } from './runtime'
import type { AppStore } from './store'

export interface AppSchema extends Schema {
  type: 'app'
  name: string
  logo?: string
}

/** 菜单选项 */
export interface INavMenuItem<T> {
  name: string
  title: string
  order: number
  parentName?: string
  pageKey?: string
  icon?: string
  path?: string
  children?: T[]
  data?: any
  meta?: any
  [prop: string]: any
}

export type NavMenuItem = INavMenuItem<NavMenuItem>

/** 菜单配置，便于合并 */
export interface NavMenuItemConfig extends Partial<INavMenuItem<NavMenuItemConfig>> {
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
  onError?: (
    handler: (error: any, to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) => any
  ) => void
}

export interface AppUI extends RuntimeUI {
  root: VueComponent
  router?: AppRouterConfig
  install?: PromiseFunction

  [prop: string]: any
}

export interface AppConfig extends RuntimeConfig {
  app?: Record<string, any>
}

/** 运行时启动选项 */
export interface AppOptions extends InstallableOptions {
  ui: AppUI
  el?: Element | string
  schema?: AppSchema
  config?: AppConfig
}

// 运行时配置

export interface AppInstanceOptions {
  ui: AppUI
  router: Router
  store: AppStore
  el?: Element | string
  plugins?: Plugin[]
  widgets?: Widget[]
  [prop: string]: any
}

/**
 * App启动选项
 *  T 为框架组件类型（vue为Vue）
 */
export interface NormalizedAppOptions extends Required<AppOptions> {
  schema: AppSchema
}

// 应用加载器
export interface AppLoader {
  name: string
}

// 权限加载器
export interface AppAuthLoader extends AppLoader {
  // 检查应用认证
  checkAuth: (config: AppConfig) => PromiseObject

  // 获取用户信息
  getUserInfo: (...args: any[]) => Promise<any>

  // 解析获取的菜单数据
  getMenuData: (...args: any[]) => Promise<NavMenuItem[]>

  // 登出
  logout: (...args: any[]) => Promise<void>
}

// 页面加载器
export interface AppPageLoader extends AppLoader {
  loadPage: (path: string) => Promise<PageSchema | undefined>
}

/**
 * 用户相关Api
 */
export interface AppUserApi {
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

export interface AppRendererOptions {
  [prop: string]: any
}

/** 应用渲染选项 */
export interface AppRenderPageOptions {
  el: string
  path: string
  schema: Schema
  [prop: string]: any
}

export interface AppRendererPage {
  key: string
  schema: Schema
  [prop: string]: any
}

import type { AppLoaderType } from '../consts'
import type { App } from '../app/App'
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
  Nil,
  Widget,
  Plugin,
  Schema,
  AppSchema,
  PageSchema,
  PartialPageSchema,
  PromiseFunction,
  PromiseObject,
  Loader
} from '@zto/zpage-core'
import type { FfbProcessor } from '@zto/zpage-ffb'

import type {
  AppConfigDefinition,
  AppAppConfig,
  AppApiConfig,
  AppApisDefinition,
  AppPageDefinition,
  AppExContext
} from './config'
import type { InstallableOptions, TextFormatters, ApiRequest, RuntimeUI, RuntimeExtensions } from './runtime'
import type { AppDatas } from './store'
import type { HttpRequest, HttpRequestConfig } from '../utils'

/** 应用环境变量 */
export interface AppEnv {
  readonly name: string // 当前环境名
  [prop: string]: any
}

export type AppEnvConfig<T = AppEnv> = Omit<T, 'name'>

/** 主机域名和环境变量的映射 */
export interface AppEnvMap<T = AppEnv> {
  [envName: string]: {
    HOSTs: string[]
    ENV: AppEnvConfig<T>
  }
}

export interface AppSchema extends Schema {
  type: 'app'
  name?: string
  logo?: string
}

export type PartialAppSchema = Omit<AppSchema, 'type'>

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
  isSubmodule: boolean
  defaultMenu?: NavMenuItemConfig
}

export interface AppRouterConfig {
  router?: Router
  routes?: RouteRecordRaw[]
  beforeEach?: NavigationGuardWithThis<undefined>
  afterEach?: NavigationHookAfter
  beforeResolve?: NavigationGuardWithThis<undefined>
  onError?: (handler: (error: any, to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) => any) => void
}

export interface AppUI extends RuntimeUI {
  root: VueComponent
  router?: AppRouterConfig
  install?: PromiseFunction
  useMessage: () => any
  showMessage: (options?: any) => void
  showMessageBox: (options?: any) => void

  [prop: string]: any
}

export interface AppExtensions extends RuntimeExtensions {
  loaders?: AppLoader[]
  widgets?: Widget[]
  components?: VueComponent[]
  formatters?: TextFormatters
  plugins?: Plugin[]
}

export type AppExtensionOptions = AppExtensions

/** 应用配置 */
export interface AppConfigOptions {
  schema?: AppConfigDefinition<PartialAppSchema>
  app?: AppConfigDefinition<AppAppConfig>
  menus?: AppConfigDefinition<NavMenuItemConfig[]>
  api?: AppConfigDefinition<AppApiConfig>
  apis?: AppApisDefinition
  widgets?: AppConfigDefinition
  components?: AppConfigDefinition
  assets?: AppConfigDefinition
}

/** 运行时启动选项 */
export interface AppStartOptions extends InstallableOptions {
  name: string // 应用名称
  isDebug?: boolean // 是否调试模式
  isMicro?: boolean // 是否微应用（微服务时应用，默认false）
  container?: Element | string
  env: AppEnv // 应用环境变量
  ui: AppUI
  exContext?: AppExContext // 扩展上下文
  menus?: NavMenuItem[]
  pages?: AppPageDefinition[]
  config?: AppConfigOptions
  configs?: AppConfigOptions[]
  extensions?: AppExtensionOptions
  meta?: (app: App) => MetaAppMetadata // 用于调试元应用时单独启动元应用
  initTrace?: (app: App, options: AppStartOptions) => void // 用于trace init
}

export interface PartialAppStartOptions extends Partial<AppStartOptions> {
  options?: Partial<AppOptions>
}

/** 应用构造函数选项 */
export interface AppCtorOptions extends AppStartOptions {}

/** 以app为上下文的操作 */
export interface AppContextOptions {
  app: App
  [prop: string]: any
}

/** 默认应用上下文 */
export interface AppContext {
  runtime: typeof runtime
  app: App

  route?: RouteLocationNormalizedLoaded
  datas: AppDatas
}

/** 应用扩展上下文 */
export interface AppExContext {
  options?: DataOptionItems

  [prop: string]: any
}

export interface PageContext extends AppDatas {
  runtime: typeof runtime
  app: App
  apis: AppApis
  api: AppApi

  datas: AppDatas

  route?: RouteLocationNormalizedLoaded
  data?: any

  options?: DataOptionItems

  [prop: string]: any
}

// 应用加载器
export interface AppLoader extends Loader {
  type: AppLoaderType
  name: string
}

// 权限加载器
export interface AppAuthLoader extends AppLoader {
  type: AppLoaderType.AUTH

  // 检查应用认证
  checkAuth: (app: App, ...args: any[]) => PromiseObject

  // 获取用户信息
  getUserInfo: (app: App, ...args: any[]) => Promise<any>

  // 解析获取的菜单数据
  getMenuData: (app: App, ...args: any[]) => Promise<NavMenuItem[]>

  // 登出
  logout: (app: App, ...args: any[]) => Promise<void>
}

// 页面加载器
export interface AppPageLoader extends AppLoader {
  type: AppLoaderType.PAGE

  loadPage: (app: App, path: string) => Promise<PageSchema | Nil>
}

export interface AppApi extends HttpRequest {
  request: ApiRequest
  [prop: string]: any
}

/**
 * 用户相关Api
 */
export interface AppAuthApi extends AppApi {
  checkAuth?: PromiseFunction // 检查权限, 一般给auth loader用
  getToken?: PromiseFunction // 获取接口调用token
  exchangeToken?: PromiseFunction // 交换token
  getUserInfo?: PromiseFunction // 获取用户信息
  logout?: PromiseFunction // 登出系统
  checkPermission?: (...args: any[]) => boolean // 检查权限
  [prop: string]: any
}

/**
 * 文件系统相关Api
 */
export interface AppFsApi extends AppApi {
  getFileUrls?: PromiseFunction // 根据文件名称获取文件地址
  getUploadToken?: PromiseFunction // 获取上传token
  deleteFile?: PromiseFunction // 删除文件
  downloadFile?: (fileName: string, options?: any) => Promise<void> // 下载文件
  [prop: string]: any
}

/** 应用Apis */
export interface AppApis {
  appApi: AppApi
  fsApi: AppFsApi
  authApi: AppAuthApi
  [prop: string]: AppApi
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

/** 元应用配置元数据 */
export interface MetaAppMetadata {
  name: string
  style?: boolean | string
  app: MetaAppOptions
}

/** 元应用安装方法 */
export type MetaAppInstallFunction = (app: App) => Promise<void>

/** 元应用项， 元应用不能包含UI */
export interface MetaAppOptions
  extends Partial<
    Omit<AppStartOptions, 'ui' | 'name' | 'env' | 'isDebug' | 'isMicro' | 'container' | 'configs' | 'menus'>
  > {
  envMap?: AppEnvMap
  install?: MetaAppInstallFunction
}

/** 为应用配置 */
export interface MetaAppCtorOptions extends MetaAppOptions {
  name: string
}

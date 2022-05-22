import { createApp, onUnmounted, watch, computed } from 'vue'
import { createPinia, Pinia, setActivePinia, getActivePinia } from 'pinia'
import { Router, useRoute } from 'vue-router'
import { AppError, ErrorCodes } from '@zto/zpage-core'

import { AppLoaderType, FlushAppContextType } from '../consts'
import { _, tpl, warn, queryEl, formatText, Emitter, HttpRequest } from '../utils'
import { getInnerLoaders, mergeLoaders } from './loaders'
import { defineAndUseAppStores } from './store'
import { createAppRouter } from './router'
import { install } from './install'
import { isWidgetEventKey } from './composables'
import { useAppConfigs, useAppPages } from './config/use-config'

import * as runtime from '../ZPageRuntime'

import type { Widget, Plugin, PageSchema } from '@zto/zpage-core'
import type {
  VueApp,
  VuePlugin,
  VueComponent,
  Installable,
  AppStartOptions,
  AppConfig,
  AppLoader,
  AppAuthLoader,
  AppPageLoader,
  AppStores,
  AppApis,
  AppCtorOptions,
  AppUI,
  AppContext,
  PageContext,
  AppApi,
  AppApiConfig
} from '../typings'

import type { TextFormatters, FormatTextOptions } from '../typings'

/** 已创建的应用名 */
const __app_names: string[] = []

export class App implements Installable {
  readonly env: any
  readonly isHost: boolean
  readonly name: string
  readonly config: AppConfig
  readonly emitter: Emitter
  readonly stores: AppStores
  readonly ui: AppUI
  readonly router: Router

  readonly apis: AppApis
  readonly pages: PageSchema[]

  private _container?: Element | undefined
  private _vueApp?: VueApp<Element>

  private _context: AppContext

  private _pinia: Pinia

  private _loaders: AppLoader[]
  private _widgets: Widget[] = []
  private _plugins: Plugin[] = []
  private _formatters: TextFormatters

  // 应用错误
  private _error: AppError | undefined

  constructor(opts: AppCtorOptions) {
    if (__app_names.includes(opts.name)) {
      throw new Error(`应用名${opts.name}已存在！`)
    }

    this.name = opts.name
    this.isHost = opts.isHost
    this.emitter = new Emitter()
    this.env = Object.freeze({ ...opts.env })
    this.ui = opts.ui

    this._container = queryEl(opts.container)

    // 初始化应用配置
    const config = useAppConfigs(this, [opts.config, ...(opts.configs || [])])
    this.config = config
    this.apis = this._initApis()

    this.pages = useAppPages(this, opts.pages)

    // 创建vueApp
    this._vueApp = createApp(opts.ui.root, { schema: config.schema })
    this._vueApp.config.globalProperties.$app = this

    // 创建store
    this._pinia = createPinia()
    this._pinia.use(() => ({ app: this })) // 设置全局上下文
    this.stores = defineAndUseAppStores(this)
    this._vueApp.use(this._pinia)

    // 创建router
    this.router = createAppRouter(this, this.ui.router)

    // 创建应用上下文
    this._context = { runtime, app: this, datas: {} }

    const exts = opts.extensions || {}

    // 创建加载器
    this._loaders = mergeLoaders(getInnerLoaders(), exts.loaders)

    // 自定义格式化
    this._formatters = Object.freeze(exts.formatters || {})

    __app_names.push(this.name)
  }

  // 初始化api
  private _initApis(): AppApis {
    const baseCfg = this.config.api

    const initApi = (apiCfg: AppApiConfig) => {
      const baseUrl = apiCfg.baseUrl || baseCfg.baseUrl

      const cfg = { ...apiCfg, ...baseCfg }

      const api = new HttpRequest(baseUrl, cfg) as any
      api.request = cfg.request

      // 合并应用方法
      let baseMethods = _.isFunction(baseCfg.methods) ? baseCfg.methods!(api) : baseCfg.methods || {}
      let apiMethods = _.isFunction(cfg.methods) ? cfg.methods!(api) : cfg.methods || {}

      const allMethods = { ...apiMethods, ...baseMethods }

      Object.keys(allMethods).forEach(name => {
        api[name] = allMethods[name]
      })

      return api as AppApi
    }

    const apiCfgs = this.config.apis

    const apis = Object.keys(apiCfgs).reduce((rtn, key) => {
      rtn[`${key}Api`] = initApi(apiCfgs[key])
      return rtn
    }, {} as Record<string, AppApi>)

    return apis as AppApis
  }

  get api() {
    return this.apis.appApi
  }

  get plugins() {
    return this._plugins
  }

  get widgets() {
    return this._widgets
  }

  get vueApp() {
    return this._vueApp as VueApp
  }

  get pinia() {
    return this._pinia
  }

  get error() {
    return this._error
  }

  get request() {
    return this.api?.request
  }

  /** 激活当前应用 */
  active() {
    if (this._pinia === getActivePinia()) return
    setActivePinia(this._pinia)
  }

  /**
   * 创建渲染器实例
   * @param options - 渲染选项
   */
  async start(options: AppStartOptions) {
    const { appStore } = this.stores

    // 安装ui
    if (this.ui.install) await this.ui.install(this, options)

    try {
      const authLoader = this.useAuthLoader()
      if (authLoader) {
        await authLoader.checkAuth(this)
      }
    } catch (ex) {
      this.setError(ex, '验证权限错误')
    }

    // 加载app初始化数据
    await appStore.load(options)

    // 安装应用(组件、微件、插件)
    await install(this, options)

    // 执行app加载
    const onLoad = this.config.app?.onLoad
    if (onLoad) await Promise.resolve().then(() => onLoad(this, options))

    // 设置应用加载成功
    appStore.setLoaded(true)

    this.vueApp.use(this.router)

    // 监控currentRoute变化
    watch(
      () => this.router.currentRoute.value,
      () => {
        this._context.route = this.router.currentRoute.value
      }
    )

    await this.router.isReady()

    this.vueApp.mount(this._container)

    // 缓存错误
    if (this.error) {
      const pathName = this.error.code === ErrorCodes.APP_AUTH_ERROR ? '403' : '500'

      await this.router.replace({
        name: pathName,
        params: {
          description: this.error.description,
          message: this.error.message
        }
      })

      this.clearError()
    }

    return this
  }

  /**
   * 卸载应用
   * @returns
   */
  async stop() {
    // 执行app加载
    const onUnload = this.config.app?.onUnload
    if (onUnload) await Promise.resolve().then(() => onUnload(this))

    this.stores.appStore.setLoaded(false)

    if (!this.vueApp) return

    this.vueApp.unmount()
    this._vueApp = undefined
  }

  async destroy() {
    await this.stop()

    const appIndex = __app_names.indexOf(this.name)
    if (appIndex > -1) __app_names.splice(appIndex, 1)
  }

  /**
   * 加载组件
   * @param el - 容器元素
   * @returns
   */
  mount(el: Element | string) {
    if (el) {
      this._container = queryEl(el)
    }

    this.vueApp.mount(this._container)
    return this
  }

  /** 登出系统 */
  async logout() {
    const authLoader = this.useAuthLoader()
    if (!authLoader) return

    return await authLoader!.logout(this)
  }

  /** 获取上传token */
  async getUploadToken() {
    if (!this.apis.fsApi.getUploadToken) throw new Error('fsApi为定义 getUploadToken')

    const token = await this.apis.fsApi.getUploadToken()
    return token
  }

  useWidgetSchema(schema: any, payload?: any) {
    if (typeof schema === 'function') {
      const ctx = this.useContext(payload)
      return schema.call(null, ctx)
    }

    return schema
  }

  useComputedWidgetSchema(schema: any, payload?: any) {
    return computed(() => this.useWidgetSchema(schema, payload))
  }

  useWidgetEmitter(schema: any, handlerMap: Record<string, Function>) {
    if (!handlerMap) return

    Object.keys(handlerMap).forEach(key => {
      if (!isWidgetEventKey(key)) return

      const evtTypes = schema[key] as any
      const evtHandler = handlerMap[key] as any

      this.emitter.ons(evtTypes, evtHandler)
    })

    onUnmounted(() => {
      Object.keys(handlerMap).forEach(key => {
        if (!isWidgetEventKey(key)) return

        const evtTypes = schema[key] as any
        const evtHandler = handlerMap[key] as any

        this.emitter.offs(evtTypes, evtHandler)
      })
    })
  }

  useRoute() {
    return useRoute()
  }

  /** 获取loader */
  useLoader<T extends AppLoader>(type: AppLoaderType, name: string): T | undefined {
    if (!type || !name) return undefined

    if (typeof name === 'object') return name

    const _loader = this._loaders.find(it => it.type === type && it.name === name)
    return _loader as T | undefined
  }

  /** 获取auth loader, 默认获取当前配置的loader */
  useAuthLoader(name?: string): AppAuthLoader | undefined {
    if (!name) name = this.useAppConfig('auth', {}).loader
    if (!name) return undefined

    return this.useLoader<AppAuthLoader>(AppLoaderType.AUTH, name)
  }

  /** 获取page loader, 默认获取当前配置的loader */
  usePageLoader(name?: string): AppPageLoader | undefined {
    if (!name) name = this.useAppConfig('page', {}).loader
    if (!name) return undefined

    return this.useLoader<AppPageLoader>(AppLoaderType.PAGE, name)
  }

  /** 刷新缓存的App上下文 */
  flushContext(flushType: FlushAppContextType = FlushAppContextType.PAGE) {
    const { appStore, userStore, pagesStore } = this.stores

    const _context = this._context

    const _datas = _context.datas || {}

    // 刷新App
    if (flushType & FlushAppContextType.APP) {
      // 刷新app相关内容数据内容
      _datas.app = { ...appStore.data, appId: appStore.appId }
    }

    // 刷新用户
    if (flushType & FlushAppContextType.USER) {
      // 刷新app相关内容数据内容
      _datas.user = {
        ...userStore.data,
        nickname: userStore.nickname,
        userId: userStore.userId,
        mobile: userStore.mobile,
        avatar: userStore.avatar,
        username: userStore.username
      }
    }

    _datas.page = { ...pagesStore.currentPage.data }

    return { ..._context }
  }

  /** 获取当前实时上下文 */
  useContext(data: any = {}): PageContext {
    const ctx = { ...this._context, apis: this.apis, api: this.api, data }
    return ctx
  }

  useConfig(path: string, defaultValue?: unknown) {
    const cfg = _.get(this.config, path, defaultValue)
    return cfg
  }

  useAppConfig(path?: string, defaultValue?: unknown) {
    const _path = path ? `.${path}` : ''
    return this.useConfig(`app${_path}`, defaultValue)
  }

  /**
   * @deprecated 后续将直接使用app.api.request
   * 应用api
   */
  useApiRequest() {
    return this.api.request
  }

  useWidgetsConfig(path: string, defaultValue?: unknown) {
    const _path = path ? `.${path}` : ''
    return this.useConfig(`widgets${_path}`, defaultValue)
  }

  useComponentsConfig(path: string, defaultValue?: unknown) {
    const _path = path ? `.${path}` : ''
    return this.useConfig(`components${_path}`, defaultValue)
  }

  /**
   * @deprecated 后续将直接使用app.env
   * 应用api
   */
  useEnv<T = any>(envName?: string): T {
    if (!envName) return this.env
    return this.env[envName]
  }

  /** 获取制定页面配置 */
  usePage(path: string) {
    const pages = this.pages

    if (!pages?.length) return undefined

    const page = pages.find((it: any) => it?.path === path)
    return page
  }

  /**
   * @deprecated 后续将直接使用 app.api
   * @param name
   * @returns
   */
  useApi(name: string = 'app') {
    return this.useConfig(`apis.${name}`)
  }

  useAssets(path?: string, defaultValue?: unknown) {
    const _path = path ? `.${path}` : ''
    return this.useConfig(`assets${_path}`, defaultValue)
  }

  /** 获取当前消息组件 */
  useMessage() {
    return this.ui.useMessage()
  }

  setError(err: any, description?: string) {
    this._error = new AppError(err, description)
  }

  clearError() {
    this._error = undefined
  }

  /** 设置页面数据 */
  async setPageData(path: string, data: any) {
    await this.stores.pagesStore.setCurrentPageData({ path, data })
  }

  /** 获取当前页面数据 */
  useCurentPage() {
    return this.stores.pagesStore.currentPage
  }

  async setAppData(path: string, data: any) {
    await this.stores.appStore.setData({ path, data })
  }

  /** 应用vue插件 */
  useVuePlugin(plugin: VuePlugin, ...options: any[]) {
    if (!this.vueApp) {
      warn('请先执行实例化再加载插件。')
      return this
    }

    this.vueApp.use(plugin, ...options)
    return this
  }

  /** 应用zpage 插件 */
  async apply(plugins: Plugin | Plugin[], ...options: any[]) {
    const existsNames = this.plugins.map(p => p.name)

    let pItems: Plugin[] = []

    if (Array.isArray(plugins)) {
      pItems = plugins
    } else {
      pItems = [plugins]
    }

    for (const p of pItems) {
      if (p.name) {
        if (existsNames.includes(p.name)) {
          warn(`插件${p.name}已应用，无法重复应用。`)
        } else {
          if (p.install) {
            await p.install(this, ...options)
          }
          this.plugins.push(p)
        }
      } else {
        throw new Error('请提供插件名称。')
      }
    }
  }

  // 注册微件
  async register(widgets: VueComponent | VueComponent[]) {
    if (!this.vueApp) {
      warn('请先执行实例化再注册微件。')
      return
    }

    let wItems: VueComponent[] = []

    if (Array.isArray(widgets)) {
      wItems = widgets
    } else {
      wItems = [widgets]
    }

    const existsWNames = this.widgets.map(w => w.name)

    for (const w of wItems) {
      if (w.name) {
        if (existsWNames.includes(w.name)) {
          warn(`微件${w.name}已注册，无法重复注册。`)
        } else {
          this.vueApp.component(w.name, w)
          this.widgets.push(w as any)
        }
      } else {
        throw new Error('请提供微件名称。')
      }
    }
  }

  /** 计算On表达式的值 */
  calcOnExpression(onExp: string | Function | undefined, contextData: any, defaultValue: boolean): boolean {
    if (!onExp) return defaultValue

    const context = this.useContext(contextData)

    let rtn = defaultValue

    if (_.isString(onExp)) {
      rtn = tpl.evalExpression(onExp, context)
    } else if (_.isFunction(onExp)) {
      rtn = onExp(context)
    }

    if (_.isNil(rtn)) return defaultValue

    return Boolean(rtn)
  }

  // 格式化
  formatText(val: any, f: string | Function | Record<string, any>, options?: FormatTextOptions) {
    const opts = options || {}
    opts.formatters = { ...this._formatters, ...opts.formatters }

    return formatText(val, f, opts)
  }

  filter(target: any, data: any = {}) {
    const ctx = this.useContext(data)
    return tpl.filter(target, ctx)
  }

  /** 深度过滤 */
  deepFilter(target: any, data: any = {}) {
    const ctx = this.useContext(data)
    const res = tpl.deepFilter(target, ctx)

    return res
  }
}

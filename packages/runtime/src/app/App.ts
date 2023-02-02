import { reactive, createApp, onUnmounted, watch, computed, resolveComponent } from 'vue'
import { createPinia, Pinia } from 'pinia'
import { Router, useRoute } from 'vue-router'
import { AppError, ErrorCodes, Nil } from '@zto/zpage-core'

import { AppLoaderType, FlushAppContextType, PAGE_SEARCH_DATA_KEY, PAGE_SEARCH_EVENT_KEY } from '../consts'
import { _, tpl, warn, queryEl, formatText, Emitter } from '../utils'
import { getInnerLoaders, mergeLoaders } from './loaders'
import { defineAndUseAppStores } from './store'
import { createAppRouter, processAppInitialLocation } from './router'
import { installUI, installRouter, installPlugins } from './install'
import { isWidgetEventKey, normalizeEventTypes } from './composables'
import { useAppConfigs, useAppPages } from './config/use-config'
import { HostApp } from './HostApp'

import { InternalAppAuth, InternalAppToken, InternalAppMicro } from './_internal'
import { initalizeApis, normalizeWidgetName } from './_internal/util'

import { storage } from '../utils'
import * as runtime from '../ZPageRuntime'

import type { Handler } from 'mitt'
import type { Widget, Plugin, PageSchema } from '@zto/zpage-core'
import type {
  VueApp,
  VuePlugin,
  VueComponent,
  Installable,
  AppStartOptions,
  AppEnv,
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
  AppPageDefinition,
  DataOptionItem
} from '../typings'

import type { TextFormatters, FormatTextOptions, DataOptionItems } from '../typings'

/** 已创建的应用名 */
const __app_names: string[] = []

export class App implements Installable {
  readonly isDebug: boolean // 当前是否调试模式
  readonly isMicro: boolean // 当前应用是否微应用
  readonly emitter: Emitter // 应用事件
  readonly stores: AppStores // 应用store
  readonly ui: AppUI // 应用UI
  readonly router: Router // 应用路由

  readonly auth: InternalAppAuth
  readonly token: InternalAppToken
  readonly micro: InternalAppMicro

  readonly _name: string // 应用名
  readonly _env: AppEnv // 应用环境变量
  readonly _config: AppConfig // 应用配置

  readonly _apis: AppApis // 应用api
  readonly _pages: PageSchema[] // 本地pages
  readonly _loaders: AppLoader[]
  readonly _formatters: TextFormatters

  private _container?: Element | undefined
  private _vueApp?: VueApp<Element>

  private _context: AppContext
  private _exContext: Partial<PageContext>

  private _pinia: Pinia

  private _widgets: Widget[] = []
  private _plugins: Plugin[] = []

  // 应用错误
  private _error: AppError | undefined

  constructor(opts: AppCtorOptions) {
    this.isDebug = opts.isDebug === true // 默认false
    this.isMicro = opts.isMicro === true // 默认false

    if (__app_names.includes(opts.name)) {
      throw new Error(`应用名${opts.name}已存在！`)
    }

    this.emitter = new Emitter()
    this.ui = opts.ui

    this._container = queryEl(opts.container)

    this._name = opts.name
    this._env = Object.freeze({ ...opts.env })
    this._exContext = { ...opts.exContext }

    // 初始化应用配置
    const config = useAppConfigs(this, [opts.config, ...(opts.configs || [])])
    this._config = config

    this._apis = this._initApis()

    this._pages = useAppPages(this, opts.pages)

    // 创建vueApp
    this._vueApp = createApp(opts.ui.root, { schema: config.schema })
    this._vueApp.config.globalProperties.$app = this

    // 创建store
    this._pinia = createPinia()
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

    this.token = InternalAppToken.retrieveInstance(this)

    this.auth = InternalAppAuth.retrieveInstance(this)

    this.micro = InternalAppMicro.retrieveInstance(this)

    __app_names.push(this._name)
  }

  // 初始化api
  private _initApis(): AppApis {
    const baseCfg = this._config.api

    const apiCfgs = this._config.apis

    const apis = initalizeApis(apiCfgs, baseCfg)

    return apis as AppApis
  }

  /** 是否独立的应用（非微应用或者微应用非调试状态） */
  get isIndependent() {
    return !this.isMicro || this.isDebug
  }

  /** 应用已加载 */
  get loaded() {
    return this.stores.appStore.loaded
  }

  /** 当前激活的元应用 */
  get metaApp() {
    return this.micro?.activeApp
  }

  /** 后去当前vue应用实例 */
  get vueApp() {
    return this._vueApp as VueApp
  }

  /** 获取当前路由 */
  get currentRoute() {
    return this.router.currentRoute
  }

  get error() {
    return this._error
  }

  /** 获取当前应用名 */
  get name() {
    return this.metaApp ? this.metaApp.name : this._name
  }

  get env() {
    return this.metaApp ? this.metaApp.env : this._env
  }

  get config() {
    return this.metaApp ? this.metaApp.config : this._config
  }

  get apis() {
    return this.metaApp ? this.metaApp.apis : this._apis
  }

  get pages() {
    return this.metaApp ? this.metaApp.pages : this._pages
  }

  get exContext() {
    return this.metaApp ? this.metaApp.exContext : this._exContext
  }

  get api() {
    return this.metaApp?.api || this._apis.appApi
  }

  get request() {
    return this.api?.request
  }

  get loaders() {
    return this.metaApp ? this.metaApp.loaders : this._loaders
  }

  get plugins() {
    return this._plugins
  }

  get widgets() {
    return this._widgets
  }

  get storage() {
    return storage
  }

  /**
   * 创建渲染器实例
   * @param options - 渲染选项
   */
  async start(options: AppStartOptions) {
    if (this.isMicro && !this.isDebug && !HostApp.loaded) {
      this.setError(new Error('宿主应用未加载，无法启动微应用！'))
    }

    await installUI(this, options)

    if (this.ui.install) await this.ui.install(this, options)

    // 非调试状态下的微应用不检查认证
    if (!this.error) {
      try {
        await this.auth.checkStartAuth()
      } catch (ex) {
        this.setError(ex, '验证权限错误')
      }
    }

    const { userStore, appStore } = this.stores

    if (!this.error) {
      try {
        // 加载用户信息(独立应用才需要加载用户信息)
        if (this.isIndependent) {
          await userStore.load({ root: true })
        }

        // 加载app初始化数据
        await appStore.load(options)
      } catch (ex) {
        this.setError(ex, '加载应用数据错误')
      }
    }

    if (!this.error) {
      try {
        // 安装路由
        await installRouter(this, options)
      } catch (ex) {
        this.setError(ex, '安装路由错误')
      }
    }

    if (!this.error) {
      try {
        // 安装插件
        await installPlugins(this, options)
      } catch (ex) {
        this.setError(ex, '安装插件错误')
      }
    }

    if (!this.error) {
      try {
        // 执行app加载
        const onLoad = this._config.app?.onLoad
        if (onLoad) await Promise.resolve().then(() => onLoad(this, options))

        // 设置应用加载成功
        appStore.setLoaded(true)
      } catch (ex) {
        this.setError(ex, '调用加载方法失败')
      }
    }

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

    await this.micro.start()

    // 检查应用错误
    await this.checkError()

    // 第一次加载出现临时路径刷新问题
    processAppInitialLocation(this)

    return this
  }

  /**
   * 卸载应用
   * @returns
   */
  async stop() {
    await this.micro.stop()

    // 执行app卸载
    const onUnload = this._config.app?.onUnload
    if (onUnload) await Promise.resolve().then(() => onUnload(this))

    this.stores.appStore.setLoaded(false)

    if (!this.vueApp) return

    this.vueApp.unmount()
    this._vueApp = undefined
  }

  /**
   * 卸载所有应用
   */
  async destroy() {
    await this.stop()

    const appIndex = __app_names.indexOf(this._name)
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

  /** 应用Store */
  applyStore(useStoreMethod: Function) {
    return useStoreMethod(this._pinia)
  }

  /** 获取宿主应用 */
  useHostApp(): App {
    // 微应用默认获取HostApp AuthLoader
    if (this.isMicro) {
      if (HostApp.loaded) return HostApp.app as App

      if (!this.isDebug) throw new Error('宿主应用未加载')
    }

    return this
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

  useWidgetEmitter(schema: any, handlerMap: Record<string, Handler>) {
    this.useEventListeners(schema, handlerMap)
  }

  useEventListeners(listeners: any, handlerMap: Record<string, Handler>) {
    if (!listeners || !handlerMap) return

    const currentPageKey = this.currentRoute.value.meta?.pageKey as string

    Object.keys(handlerMap).forEach(key => {
      if (!isWidgetEventKey(key)) return
      if (!listeners[key]) return

      const eventTypes = normalizeEventTypes(listeners[key] as any, currentPageKey)
      const eventHandler = handlerMap[key] as any

      this.emitter.ons(eventTypes, eventHandler)
    })

    onUnmounted(() => {
      Object.keys(handlerMap).forEach(key => {
        if (!isWidgetEventKey(key)) return
        if (!listeners[key]) return

        const eventTypes = normalizeEventTypes(listeners[key] as any, currentPageKey)
        const eventHandler = handlerMap[key] as any

        this.emitter.offs(eventTypes, eventHandler)
      })
    })
  }

  /** 触发事件 */
  emits(eTypes: string[] | string, payload?: any) {
    const currentPageKey = this.currentRoute.value.meta?.pageKey as string

    const eventTypes = normalizeEventTypes(eTypes, currentPageKey)

    this.emitter.emits(eventTypes, payload)

    return eventTypes
  }

  /** 监听事件 */
  ons(eTypes: string[] | string, handler: Handler<unknown> | undefined) {
    const currentPageKey = this.currentRoute.value.meta?.pageKey as string

    const eventTypes = normalizeEventTypes(eTypes, currentPageKey)

    this.emitter.ons(eventTypes, handler)

    return { eventTypes, handler }
  }

  /** 解除监听事件 */
  offs(eTypes: string[] | string, handler: Handler<unknown> | undefined) {
    const currentPageKey = this.currentRoute.value.meta?.pageKey as string

    this.emitter.offs(eTypes, handler)

    // 容错
    const eventTypes = normalizeEventTypes(eTypes, currentPageKey)
    this.emitter.offs(eventTypes, handler)

    return { eventTypes, handler }
  }

  /** 获取loader */
  useLoader<T extends AppLoader>(type: AppLoaderType, name: string): T | undefined {
    if (!type || !name) return undefined

    if (typeof name === 'object') return name

    const _loader = this.loaders.find(it => it.type === type && it.name === name)
    return _loader as T | undefined
  }

  /** 获取auth loader, 默认获取当前配置的loader */
  useAuthLoader(name?: string): AppAuthLoader | undefined {
    // 微应用默认获取HostApp AuthLoader
    if (this.isMicro) {
      if (HostApp.loaded) {
        return HostApp.app?.useAuthLoader(name)
      } else if (!this.isDebug) {
        throw new Error('宿主应用未加载，获取AuthLoader失败')
      }
    }

    if (!name) name = this.useAppConfig('auth', {}).loader
    if (!name) return undefined

    return this.useLoader<AppAuthLoader>(AppLoaderType.AUTH, name)
  }

  /** 获取page loader, 默认获取当前配置的loader */
  usePageLoader(name?: string): AppPageLoader | undefined {
    if (!name) name = this.useAppConfig('page.loader', 'local') // 默认local加载器
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
    const ctx = { ...this.exContext, ...this._context, apis: this.apis, api: this.api, data }
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

  /** 解析api路径，判断获取url和ns */
  parseApiUrl(url: string) {
    if (!_.isString(url)) return url

    let _ns: string | null = null
    let _url = url

    const _parts = url.split(':')
    if (_parts[0] && this.useApi(_parts[0])) {
      _ns = _parts[0]
      if (_ns) _url = url.substring(_ns.length + 1)
    }

    return { ns: _ns, url: _url }
  }

  /**
   * 根据命名空间获取api
   * @param ns
   * @returns
   */
  useApi(ns: string = 'app') {
    return this.apis[`${ns}Api`]
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
  useEnv<T>(envName?: string): T {
    const env = this.env

    if (!envName) return env as any as T
    return env[envName]
  }

  /** 获取制定页面配置 */
  usePage(path: string): PageSchema | Nil {
    const pages = this.pages

    if (!pages?.length) return undefined

    // 判断路径是否为meta应用路径
    const page = pages.find((it: any) => it?.path === path)

    return page
  }

  /** 新增\更新\删除页面 */
  setPage(path: string, page: AppPageDefinition | Nil): PageSchema | Nil {
    if (_.isNil(page)) {
      // 删除页面
      const pageIndex = this.pages.findIndex(it => it.path === path)
      this.pages.splice(pageIndex, 1)
      return
    } else {
      const _pages = useAppPages(this, [page as any])
      this.pages.push(_pages[0])

      return _pages[0]
    }
  }

  useAssets(path?: string, defaultValue?: unknown) {
    const _path = path ? `.${path}` : ''
    return this.useConfig(`assets${_path}`, defaultValue)
  }

  /** 获取组件 */
  resolveComponent(name: string) {
    if (!_.isString(name)) return name
    if (this.metaApp) return this.metaApp.resolveComponent(name)
    return resolveComponent(name)
  }

  /** 同时获取多个组件，（方便使用） */
  resolveComponents(names: string[]) {
    const records = names.reduce((acc, name) => {
      const component = this.resolveComponent(name)
      acc[name] = component
      return acc
    }, {})

    return records as Record<string, VueComponent>
  }

  /** 获取组件 */
  resolveWidget(name: string) {
    if (this.metaApp) return this.metaApp.resolveWidget(name)

    const wName = normalizeWidgetName(name)
    return resolveComponent(wName)
  }

  setError(err: any, description?: string) {
    this._error = new AppError(err, description)

    try {
      // 记录错误信息（便于调试）
      console.log(this.error)
      storage.local.set('LAST_APP_ERROR', this.error)
    } catch (ex) {
      console.log(ex)
    }
  }

  /** 检查错误 */
  async checkError() {
    if (!this.error) return true

    const pathName = this.error.code === ErrorCodes.APP_AUTH_ERROR ? '403' : '500'

    await this.router.replace({
      name: pathName,
      params: {
        description: this.error.description,
        message: this.error.message
      }
    })

    this.clearError()

    return false
  }

  clearError() {
    this._error = undefined
  }

  /** 设置应用数据 */
  setAppData(path: string, data: any) {
    return this.stores.appStore.setData({ path, data })
  }

  /** 获取应用数据 */
  getAppData<T = any>(path?: string) {
    return this.stores.appStore.getData<T>(path)
  }

  /** 设置用户数据 */
  setUserData(path: string, data: any) {
    return this.stores.userStore.setData({ path, data })
  }

  /** 获取用户数据 */
  getUserData<T = any>(path?: string) {
    return this.stores.userStore.getData<T>(path)
  }

  /** 设置页面数据 */
  getPageData<T = any>(path?: string) {
    return this.stores.pagesStore.getCurrentPageData<T>(path)
  }

  /** 设置页面数据 */
  setPageData(path: string, data: any) {
    this.stores.pagesStore.setCurrentPageData({ path, data })
  }

  /** 设置页面查询数据 */
  getPageSearchData() {
    let searchData = this.getPageData(PAGE_SEARCH_DATA_KEY)
    if (!searchData) {
      searchData = reactive({})
      this.setPageData(PAGE_SEARCH_DATA_KEY, searchData)
    }
    return searchData
  }

  /** 设置页面查询数据 */
  setPageSearchData(key: string, data: any) {
    const searchData = this.getPageSearchData()
    searchData[key] = data
    return searchData
  }

  /** 设置页面查询数据 */
  mergePageSearchData(data: Record<string, any>) {
    const searchData = this.getPageSearchData()
    Object.entries(data).forEach(([key, value]) => {
      searchData[key] = value
    })
    return searchData
  }

  /** 这只扩展上下文 */
  setExContext(key: string, data: any) {
    this.exContext[key] = data
  }

  /** 设置通用选项 */
  setCommonOptions(data: DataOptionItems) {
    let _options = this.exContext.options || {}
    _options = { ..._options, ...data }

    this.setExContext('options', _options)
  }

  /** 获取通用选项 */
  getCommonOptions(...keys: string[]): DataOptionItem[] | DataOptionItems | undefined {
    let _options = this.exContext.options || {}

    // 长度为1直接返回
    if (keys.length === 1) {
      return _options[keys[0]]
    }

    // 返回对象
    const _opts: DataOptionItems = {}
    keys.forEach(key => {
      _opts[key] = _options[keys[0]]
    })

    return _opts
  }

  /** 获取当前页面数据 */
  useCurentPage() {
    return this.stores.pagesStore.currentPage
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
    if (this.metaApp) {
      return this.metaApp.formatText(val, f, options)
    }

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

  useRoute() {
    return useRoute()
  }

  /** 获取当前UI */
  useGlobalUI() {
    if (this.isMicro && HostApp.loaded) return HostApp.ui || this.ui
    return this.ui
  }

  /** 获取当前或者HostAppProgress */
  useProgress() {
    const ui = this.useGlobalUI()
    return ui?.useProgress()
  }

  /** 获取当前或者HostApp消息组件 */
  useMessage() {
    const ui = this.useGlobalUI()

    return ui?.useMessage()
  }

  /**
   * 检查权限
   * @param codes
   * @returns
   */
  checkPermission(codes: string | string[]) {
    return this.auth.checkPermission(codes)
  }

  /** 登出系统 */
  logout() {
    return this.auth.logout()
  }

  /** 获取上传token */
  async getUploadToken(...args: any[]) {
    if (!this.apis.fsApi.getUploadToken) throw new Error('fsApi为定义 getUploadToken')

    const token = await this.apis.fsApi.getUploadToken(...args)
    return token
  }

  /** 触发页面查询 */
  triggerPageSearch(...args: any[]) {
    this.emits(PAGE_SEARCH_EVENT_KEY, ...args)
  }
}

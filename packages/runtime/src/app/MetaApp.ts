import { resolveComponent } from 'vue'
import { App } from './App'
import { useAppConfigs, useAppPages } from './config/use-config'

import { _, formatText, resolveVueAsset, flattenTree } from '../utils'
import { mergeLoaders } from './loaders'
import { initalizeApis, camelizeSchemaName, normalizeWidgetName } from './_internal/util'

import type { PageSchema, Widget } from '@zto/zpage-core'
import type {
  AppConfig,
  MetaAppCtorOptions,
  AppEnv,
  AppApis,
  AppLoader,
  TextFormatters,
  FormatTextOptions,
  MetaAppInstallFunction,
  VueComponent,
  AppExContext,
  AppWidgetSchema,
  AppAuthLoader,
  MicroAppConfig
} from '../typings'
import { AppLoaderType } from '../consts'

import { reloadModuleRoutes } from './router/util'

/**
 * 元应用为嵌入在主应用中的应用
 * 此应用继承主应用部分特征，并保留当前应用独有的部分功能，以此与其他元应用分开
 */
export class MetaApp {
  readonly mainApp: App // 主应用

  readonly name: string
  readonly env: AppEnv

  readonly config: AppConfig
  readonly exContext: AppExContext

  readonly apis: AppApis
  readonly pages: PageSchema[]
  readonly loaders: AppLoader[]
  readonly formatters: TextFormatters

  readonly components: Record<string, VueComponent>
  readonly widgets: Record<string, Widget>
  readonly schemas: Record<string, AppWidgetSchema>

  private _install?: MetaAppInstallFunction
  private _onLoad?: Function
  private _onUnload?: Function

  constructor(mainApp: App, opts: MetaAppCtorOptions) {
    // 强制设置当前应用为元应用，以便保证应用正确初始化
    mainApp.micro._setActiveApp(this)

    this.mainApp = mainApp

    this.name = opts.name

    this._install = opts.install

    // 合并环境变量
    const envMap = opts.envMap || {}
    const env = _.deepMerge(mainApp._env, envMap[mainApp._env.name]?.ENV)
    this.env = Object.freeze(env)
    this.exContext = Object.freeze({ ...opts.exContext })

    // 初始化应用配置
    const config = useAppConfigs(mainApp, [opts.config])
    this._onLoad = config.app?.onLoad
    this._onUnload = config.app?.onUnload

    this.config = Object.freeze(_.deepMerge(mainApp._config, config))

    this.apis = this._initApis(config)

    this.pages = useAppPages(mainApp, opts.pages)

    const exts = opts.extensions || {}

    // 加载器
    this.loaders = mergeLoaders(mainApp._loaders, exts.loaders)

    // 自定义格式化
    this.formatters = Object.freeze({ ...mainApp._formatters, ...exts.formatters })

    // 安装全局组件
    this.components = (exts.components || []).reduce((acc, cur) => {
      if (cur.name) acc[cur.name] = cur
      return acc
    }, {} as Record<string, VueComponent>)

    this.widgets = (exts.widgets || []).reduce((acc, cur) => {
      acc[cur.name] = cur
      return acc
    }, {} as Record<string, Widget>)

    this.schemas = (exts.schemas || []).reduce((acc, cur) => {
      acc[cur.name] = cur
      return acc
    }, {} as Record<string, AppWidgetSchema>)

    mainApp.micro.checkActiveApp()
  }

  // 初始化api
  private _initApis(config: AppConfig): AppApis {
    const baseCfg = this.config.api
    const apiCfgs = config.apis

    const _apis = initalizeApis(apiCfgs, baseCfg)
    const apis = { ...this.mainApp._apis, ..._apis }

    return apis
  }

  get api() {
    return this.apis.appApi
  }

  /** 获取组件 */
  resolveSchema(name: string) {
    if (!_.isString(name)) return name

    let sName = camelizeSchemaName(name)
    return this.schemas[sName] || this.mainApp.schemas[name]
  }

  /** 获取组件 */
  resolveComponent(name: string) {
    let c = resolveVueAsset(this.components, name)
    if (!c) c = resolveComponent(name)
    return c
  }

  /** 获取微件 */
  resolveWidget(name: string) {
    let wName = normalizeWidgetName(name)

    let w = resolveVueAsset(this.widgets, wName)
    if (!w) w = resolveComponent(wName)

    return w
  }

  /**
   * 启用应用
   */
  async start(cfg: MicroAppConfig) {
    const mainApp = this.mainApp

    // 如果是单独配置应用，则初始化当前模块菜单
    if (cfg.singleModule === true) {
      await this._loadSingleModule(cfg.name)
    }

    // 安装元应用
    if (this._install) await this._install(mainApp)

    if (this._onLoad) await Promise.resolve().then(() => this._onLoad!(mainApp))

    return this
  }

  /** 暂停元应用 */
  async stop() {
    if (this._onUnload) await Promise.resolve().then(() => this._onUnload!(this.mainApp))
  }

  /** 加载单独模块 */
  private async _loadSingleModule(moduleName: string) {
    const { appStore, userStore } = this.mainApp.stores

    const targetModule = appStore.submodules.find(it => it.name === moduleName)
    if (!targetModule) return

    // 清理原菜单并重建
    const authLoader = this.useAuthLoader()
    if (!authLoader) return

    // 元应用动态加载菜单
    if (authLoader.getMetaUserData) {
      const userData = await authLoader.getMetaUserData(this)
      let { menus, permissions } = userData || {}

      /** TODO: 后续可以通过数据隔离的方式更安全的管理第三方应用 */

      /** 为菜单名加前缀，防止命名冲突 */
      const allMenus = flattenTree(menus || [])
      allMenus.forEach(it => {
        it.name = `${moduleName}__${it.name}`
      })

      if (!targetModule.children?.length) {
        await appStore.reloadModule(moduleName, {
          singleModule: true,
          children: menus
        })

        const baseRoute = this.mainApp.useConfig('router.base', '')
        await reloadModuleRoutes(this.mainApp.router, targetModule, baseRoute)
      }

      /** 为权限加前缀，防止命名冲突 */
      permissions = (permissions || []).map(p => `${moduleName}__${p}`)

      await userStore.patchPermissions(permissions || [])
    }
  }

  /** 获取auth loader, 默认获取当前配置的loader */
  useAuthLoader(name?: string): AppAuthLoader | undefined {
    if (!name) name = this.useAppConfig('auth', {}).loader
    if (!name) return undefined

    return this.useLoader<AppAuthLoader>(AppLoaderType.AUTH, name)
  }

  /** 获取loader */
  useLoader<T extends AppLoader>(type: AppLoaderType, name: string): T | undefined {
    if (!type || !name) return undefined

    if (typeof name === 'object') return name

    const _loader = this.loaders.find(it => it.type === type && it.name === name)
    return _loader as T | undefined
  }

  useAppConfig(path?: string, defaultValue?: unknown) {
    const _path = path ? `.${path}` : ''
    return this.useConfig(`app${_path}`, defaultValue)
  }

  useConfig(path: string, defaultValue?: unknown) {
    const cfg = _.get(this.config, path, defaultValue)
    return cfg
  }

  // 格式化
  formatText(val: any, f: string | Function | Record<string, any>, options?: FormatTextOptions) {
    const opts = options || {}
    opts.formatters = { ...this.formatters, ...opts.formatters }

    return formatText(val, f, opts)
  }
}

import { resolveComponent } from 'vue'
import { App } from './App'
import { useAppConfigs, useAppPages } from './config/use-config'

import { _, formatText, resolveVueAsset } from '../utils'
import { mergeLoaders } from './loaders'
import { initalizeApis, normalizeWidgetName } from './_internal/util'

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
  AppExContext
} from '../typings'

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
    }, {})

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
  async start() {
    const mainApp = this.mainApp

    // 安装元应用
    if (this._install) await this._install(mainApp)

    if (this._onLoad) await Promise.resolve().then(() => this._onLoad!(mainApp))

    return this
  }

  /** 暂停元应用 */
  async stop() {
    if (this._onUnload) await Promise.resolve().then(() => this._onUnload!(this.mainApp))
  }

  // 格式化
  formatText(val: any, f: string | Function | Record<string, any>, options?: FormatTextOptions) {
    const opts = options || {}
    opts.formatters = { ...this.formatters, ...opts.formatters }

    return formatText(val, f, opts)
  }
}

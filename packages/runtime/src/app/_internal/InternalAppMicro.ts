import { watch } from 'vue'
import { _, loadScript, loadCss } from '../../utils'
import { MetaApp } from '../MetaApp'
import { AppInterior } from './AppInterior'
import { checkActiveRule } from './util'

import type { App } from '../App'
import type { AppMicroConfig, MetaAppMetadata, MicroAppConfig } from '../../typings'

/**
 * 应用微应用管理器
 * 涉及到应用微应用部分，只能调用宿主应用
 */
export class InternalAppMicro extends AppInterior<InternalAppMicro> {
  protected static _instance: InternalAppMicro

  private _config: AppMicroConfig // 微应用相关配置

  private _apps: MetaApp[] = [] // 已加载的应用

  private _activeApp: MetaApp | undefined

  private constructor(app: App) {
    super(app)

    // 当前token自动刷新时间
    this._config = this.hostApp.useConfig('micro', {})
  }

  /** 获取Token实例 */
  static retrieveInstance(app: App) {
    if (InternalAppMicro._instance) return InternalAppMicro._instance

    const hostApp = app.useHostApp()

    if (!app.isIndependent) return hostApp.micro

    InternalAppMicro._instance = new InternalAppMicro(app)
    return InternalAppMicro._instance
  }

  /** 获取当前激活的应用 */
  get activeApp() {
    return this._activeApp
  }

  /** 启动微应用 */
  async start() {
    // 监控currentRoute变化并尝试激活当前应用
    watch(
      () => this.app.router.currentRoute.value,
      () => {
        this.checkActiveApp()
      }
    )
  }

  /** 停止所有微应用 */
  async stop() {
    const stops = this._apps.map(it => it.stop)
    await Promise.all(stops)
  }

  /**
   * 检查并激活应用
   * @param forceLoad 如果没有加载则强制加载
   * @returns
   */
  async checkActiveApp(forceLoad = false) {
    const appCfg = this._checkActiveAppConfig()
    if (!appCfg) {
      this._activeApp = undefined
      return
    }

    if (!appCfg.name) throw new Error('当前应用配置错误，缺少name属性')

    if (appCfg.name === this._activeApp?.name) return this._activeApp

    let app = this._apps.find(it => it.name === appCfg.name)

    if (!app && forceLoad === true) app = await this._loadApp(appCfg) // 加载应用

    this._activeApp = app

    return app
  }

  /** 检查当前路由是否激活特定App */
  private _checkActiveAppConfig() {
    // 不存在相关应用则直接退出
    if (!this._config?.apps?.length) return

    const appCfgs = this._config?.apps

    const route = this.app.router.currentRoute.value

    // 获取激活的应用
    const activeAppConfig = appCfgs.find(item => checkActiveRule(item.activeRule, this.app, route))

    return activeAppConfig
  }

  /** 加载应用 */
  private async _loadApp(cfg: MicroAppConfig) {
    // 加载应用meta信息
    const appMeta = await this._loadAppMeta(cfg)

    const appOptions = { ...appMeta.app, name: appMeta.name }

    const metaApp = new MetaApp(this.app, appOptions)

    await metaApp.start()

    this._apps.push(metaApp)

    return metaApp
  }

  /**
   * 强制激活当前应用(只用于在元应用构建时正确初始化)
   * 此方法只能用于应用构建时
   * @param metaApp
   */
  _setActiveApp(metaApp: MetaApp) {
    if (metaApp.name) throw new Error('此方法只能用于应用构建开始')

    this._activeApp = metaApp
  }

  /** 加载应用入口入口 */
  private async _loadAppMeta(cfg: MicroAppConfig) {
    const appName = cfg.name
    const entryUrl = cfg.entry

    let appEntry = window[appName]

    // 已加载则直接返回
    let loading = false // 用于确保script和css同步加载且只加载一次
    if (!appEntry) {
      if (!entryUrl) throw new Error('当前应用配置错误，需要提供entry属性')

      const scriptUrl = `${entryUrl}/meta/index.js?ts=${Date.now()}`
      await loadScript(scriptUrl)

      appEntry = window[appName]

      loading = true
    }

    if (!appEntry) throw new Error(`未获取到${cfg.name}应用，请检查应用名称是否正确`)

    if (!appEntry?.meta) throw new Error(`未获取到${cfg.name}应用的meta信息`)

    const appMeta = appEntry.meta(this.app)

    if (loading && appMeta.style !== false) {
      let styleName = _.isString(appMeta.style) ? appMeta.style : `style.css`
      const styleUrl = `${entryUrl}/meta/${styleName}?ts=${Date.now()}`
      loadCss(styleUrl)
    }

    return appMeta as MetaAppMetadata
  }
}

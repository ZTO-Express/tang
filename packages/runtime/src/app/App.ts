import { createApp } from 'vue'
import { warn, queryEl } from '../utils'
import { AppRenderer } from './renderer/AppRenderer'

import type { Widget, Plugin } from '@zto/zpage-core'
import type { VueApp, VuePlugin, VueComponent, Installable, AppInstanceOptions, AppRenderPageOptions } from '../typings'

/**
 * Vue3运行器
 */
export class App implements Installable {
  private _options: AppInstanceOptions
  private _el?: Element
  private _vueApp?: VueApp<Element>

  private _widgets: Widget[] = []
  private _plugins: Plugin[] = []

  private _renderer: AppRenderer

  private constructor(options: AppInstanceOptions) {
    this._options = options
    this._el = options.el && queryEl(options.el)

    this._renderer = new AppRenderer({})
  }

  // 单例
  private static __instance: App | null = null

  static initialize(options: AppInstanceOptions) {
    App.__instance = new App(options)
    return App.__instance
  }

  static get instance() {
    return App.__instance
  }

  get ui() {
    return this._options.ui
  }

  get schema() {
    return this._options.schema
  }

  get store() {
    return this._options.store
  }

  get router() {
    return this._options.router
  }

  get plugins() {
    return this._plugins
  }

  get widgets() {
    return this._widgets
  }

  get vueApp() {
    return this._vueApp
  }

  /** 应用vue插件 */
  use(plugin: VuePlugin, ...options: any[]) {
    const vueApp = this.vueApp

    if (!vueApp) {
      warn('请先执行实例化再加载插件。')
      return this
    }

    vueApp.use(plugin, ...options)
    return this
  }

  /**
   * 创建渲染器实例
   * @param options - 渲染选项
   */
  async start() {
    const { ui, schema } = this

    const vueApp = createApp(ui.root, { schema })

    this._vueApp = vueApp

    // 附加到app
    vueApp.use(this.store)

    return this
  }

  /**
   * 加载组件
   * @param el - 容器元素
   * @returns
   */
  mount(el: Element | string) {
    const vueApp = this.vueApp

    if (!vueApp) {
      warn('请先执行实例化再加载。')
      return this
    }

    const mountEl = el || this._el
    vueApp.mount(mountEl)
    return this
  }

  unmount() {
    const vueApp = this.vueApp

    if (!vueApp) {
      warn('应用未实例化。')
      return this
    }

    this.vueApp.unmount()
    this._vueApp = null
  }

  // 渲染页面
  async render(options: AppRenderPageOptions) {
    return App.instance._renderer.render(options)
  }

  /** 应用zpage 插件 */
  async apply(plugins: Plugin | Plugin[], ...options: any[]) {
    const existsNames = this.plugins.map((p) => p.name)

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
    const vueApp = this.vueApp

    if (!vueApp) {
      warn('请先执行实例化再注册微件。')
      return
    }

    let wItems: VueComponent[] = []

    if (Array.isArray(widgets)) {
      wItems = widgets
    } else {
      wItems = [widgets]
    }

    const existsWNames = this.widgets.map((w) => w.name)

    for (const w of wItems) {
      if (w.name) {
        if (existsWNames.includes(w.name)) {
          warn(`微件${w.name}已注册，无法重复注册。`)
        } else {
          vueApp.component(w.name, w)
          this.widgets.push(w as any)
        }
      } else {
        throw new Error('请提供微件名称。')
      }
    }
  }
}

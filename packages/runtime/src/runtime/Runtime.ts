import { createApp } from 'vue'
import { emitter, warn, queryEl } from '../utils'
import { Entry as CEntry, Widget as CWidget } from '../entry'

import type { App, Plugin as VuePlugin, Component } from 'vue'
import type { Router } from 'vue-router'
import type { Schema, Widget, Plugin } from '@zpage/core'
import type { AppStore, AppConfig, AppRuntimeConfig, AppUI } from '../typings'

/** 返回当前实例 */
export function getCurrentInstance() {
  return Runtime.getInstance()
}

/**
 * Vue3运行器
 */
export class Runtime {
  private _app?: App<Element>
  private _el?: Element
  private _root: Component
  private _store: AppStore
  private _router: Router
  private _schema: Schema
  private _widgets: Widget[]
  private _plugins: Plugin[]

  private constructor(options: AppRuntimeConfig) {
    this._el = options.el && queryEl(options.el)
    this._root = options.root
    this._widgets = options.widgets || []
    this._schema = options.schema
    this._plugins = []

    this._store = options.store
    this._router = options.router
  }

  // 单例
  private static __runtime: Runtime | null = null

  static createInstance(options: AppRuntimeConfig) {
    Runtime.__runtime = new Runtime(options)
    return Runtime.__runtime
  }

  static getInstance() {
    return Runtime.__runtime
  }

  get root() {
    return this._root
  }

  get app() {
    return this._app
  }

  get schema() {
    return this._schema
  }

  get store() {
    return this._store
  }

  get router() {
    return this._router
  }

  get widgets() {
    return this._widgets
  }

  get plugins() {
    return this._plugins
  }

  /**
   * 创建渲染器实例
   * @param options - 渲染选项
   */
  start(config: AppConfig) {
    const { root, schema } = this

    const app = createApp(root, { schema })

    // 设置APP全局配置
    app.config.globalProperties.$APP = config

    app.component('Entry', CEntry)
    app.component('Widget', CWidget)

    app.config.globalProperties.$zpage = this

    // 安装Event Bus
    app.config.globalProperties.$emitter = emitter

    // 附加到app
    app.use(this.store)

    this._app = app

    return this
  }

  /** 应用vue插件 */
  use(plugin: VuePlugin, ...options: any[]) {
    const app = this.app

    if (!app) {
      warn('请先执行实例化再加载插件。')
      return this
    }

    app.use(plugin, ...options)
    return this
  }

  /** 应用UI */
  applyUI(ui: AppUI, ...options: any[]) {
    if (ui?.install) {
      ui.install(this, ...options)
    }
  }

  /** 应用zpage 插件 */
  apply(plugins: Plugin | Plugin[], ...options: any[]) {
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
            p.install(this, ...options)
          }
          this.plugins.push(p)
        }
      } else {
        throw new Error('请提供插件名称。')
      }
    }
  }

  // 注册微件
  register(widgets: Component | Component[]) {
    const app = this.app

    if (!app) {
      warn('请先执行实例化再注册微件。')
      return this
    }

    let wItems: Component[] = []

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
          app.component(w.name, w)
          this.widgets.push(w as any)
        }
      } else {
        throw new Error('请提供微件名称。')
      }
    }
  }

  /**
   * 加载组件
   * @param el - 容器元素
   * @returns
   */
  mount(el: Element | string) {
    const app = this.app

    if (!app) {
      warn('请先执行实例化再加载。')
      return this
    }

    const mountEl = el || this._el
    app.mount(mountEl)
    return this
  }

  unmount() {
    const app = this.app

    if (!app) {
      warn('应用未实例化。')
      return this
    }

    this.app.unmount()
    this._app = null
  }
}

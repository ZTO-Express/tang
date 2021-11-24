import { createApp, defineComponent, h } from 'vue'
import { warn } from '../utils'
import { Widget as CWidget } from '../entry'
import { install } from './install'

import type { Widget } from '@zto/zpage-core'
import type {
  VueApp,
  VueComponent,
  RendererOptions,
  Installable,
  RendererFactoryInstanceOptions
} from '../typings'

/**
 * Vue3渲染器
 */
export class RendererFactory {
  private _options: RendererFactoryInstanceOptions

  private constructor(options: RendererFactoryInstanceOptions) {
    this._options = options
  }

  // 单例
  private static __instance: RendererFactory | null = null

  static initialize(options: RendererFactoryInstanceOptions) {
    RendererFactory.__instance = new RendererFactory(options)
    return RendererFactory.__instance
  }

  static get instance() {
    return RendererFactory.__instance
  }

  get ui() {
    return this._options.ui
  }

  get options() {
    return this._options
  }

  // 渲染页面
  async render(options: RendererOptions) {
    const appRenderer = new Renderer(options)

    await appRenderer.render()

    return appRenderer
  }
}

/** 渲染实例 */
export class Renderer implements Installable {
  private _vueApp: VueApp<Element> // Vue应用
  private _widgets: Widget[] = []

  private _options: RendererOptions

  constructor(options: RendererOptions) {
    this._options = options
  }

  get vueApp() {
    return this._vueApp
  }

  get options() {
    return this._options
  }

  get widgets() {
    return this._widgets
  }

  // 开始渲染
  async render() {
    const factory = RendererFactory.instance
    const options = this.options

    const root = defineComponent({
      setup() {
        return () => {
          return h(CWidget, { schema: options.schema })
        }
      }
    })

    this._vueApp = createApp(root)

    await install(this, factory.options)

    this._vueApp.mount(options.el)

    return this
  }

  // 卸载
  async unmount() {
    const { vueApp } = this

    if (vueApp) {
      vueApp.unmount()
      this._vueApp = null
    }

    this._widgets = null
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

    const existsWNames = this.widgets.map(w => w.name)

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

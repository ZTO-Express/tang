import { App } from '../App'

import type { AppRendererOptions, AppRendererPage, AppRenderPageOptions } from '../../typings'

/** 渲染实例 */
export class AppRenderer {
  private _pages: Record<string, AppRendererPage> = {}

  private _options: AppRendererOptions

  constructor(options: AppRendererOptions) {
    this._options = options
  }

  get options() {
    return this._options
  }

  // 开始渲染
  async render(options: AppRenderPageOptions) {
    const app = App.instance

    await app.store.dispatch('pages/addTemp', options)

    return this
  }
}

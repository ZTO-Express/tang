import { HostApp } from '../HostApp'

import type { AppRendererOptions, AppRendererPage, AppRenderPageOptions } from '../../typings'

/** 渲染实例 */
export class AppRenderer {
  private _options: AppRendererOptions

  constructor(options: AppRendererOptions) {
    this._options = options
  }

  get options() {
    return this._options
  }

  // 开始渲染
  async render(options: AppRenderPageOptions) {
    const app = HostApp.app
    return this
  }
}

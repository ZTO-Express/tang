import { emitter } from '../utils'
import { RendererFactory } from './Renderer'

import type { RendererFactoryInstanceOptions } from '../typings'
import type { Renderer } from './Renderer'

/** 安装插件 */
export async function install(renderer: Renderer, options?: RendererFactoryInstanceOptions) {
  const vueApp = renderer.vueApp

  vueApp.config.globalProperties.$renderer = renderer

  // 安装Event Bus
  vueApp.config.globalProperties.$emitter = emitter

  // 安装ui
  if (RendererFactory.instance.ui.install) {
    await RendererFactory.instance.ui.install(renderer, options)
  }
}

import { _ } from '../utils'
import { setConfig } from '../config'
import { createAppStore } from '../store'
import { Renderer } from './Renderer'

import type { AppRenderOptions } from '../typings'

export const createRenderer = async (options: AppRenderOptions) => {
  const opts = _.deepMerge({}, options)
  const config = opts.config
  setConfig(Object.freeze(config))

  // 创建store
  const store = createAppStore()

  // 创建渲染器
  const renderer = Renderer.createInstance({
    root: opts.ui.root,
    store
  })

  // 初始化渲染器
  const { app } = renderer.initial(config)

  return { renderer }
}

export function useRenderer() {
  return Renderer.getInstance()
}

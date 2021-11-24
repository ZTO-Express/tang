import { _ } from '../utils'
import { setConfig } from '../config'
import { RendererFactory } from './Renderer'

import type { RendererFactoryOptions } from '../typings'

export function useRendererFactory() {
  return RendererFactory.instance
}

export const startRenderer = async (options: RendererFactoryOptions) => {
  const opts = _.deepMerge({}, options)
  const config = opts.config
  setConfig(Object.freeze(config))

  // 创建渲染器
  const renderer = RendererFactory.initialize(_.omit(opts, ['config']))

  return renderer
}

import { _ } from '../utils'
import { RendererFactory } from './Renderer'

import type { RendererFactoryOptions } from '../typings'

export function useRendererFactory() {
  return RendererFactory.instance
}

export const startRenderer = async (options: RendererFactoryOptions) => {
  const opts = _.deepMerge({}, options)

  // 创建渲染器
  const renderer = RendererFactory.initialize(opts)

  return renderer
}

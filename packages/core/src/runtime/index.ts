import type { Schema } from '../schema'
import type { Widget } from '../widget'
import type { Plugin } from '../plugin'

/**
 * 运行时配置
 */
export interface RuntimeConfig<T = unknown> {
  el: Element | string // 渲染dom节点
  root: T // 根组件
  schema: Schema
  plugins?: Plugin[]
  widgets?: Widget[]
  [prop: string]: any
}

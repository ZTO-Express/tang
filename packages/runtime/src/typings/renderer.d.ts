import type { Schema } from '@zpage/core'
import type { InstallableOptions, RuntimeConfig, RuntimeUI } from './runtime'

export interface RendererUI extends RuntimeUI {
  [prop: string]: any
}

export type RendererFactoryConfig = RuntimeConfig

export interface RendererFactoryOptions extends InstallableOptions {
  ui: RendererUI
  config?: RendererFactoryConfig
  [prop: string]: any
}

export interface RendererFactoryInstanceOptions extends InstallableOptions {
  ui: RendererUI
  [prop: string]: any
}

/** 应用渲染选项 */
export interface RendererOptions {
  el: string | Element
  schema: Schema
  [prop: string]: any
}

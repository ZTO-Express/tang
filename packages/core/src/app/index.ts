import type { AppConfig } from './config'
import type { AppExtends } from './extends'

export type { AppConfig, AppExtends }

/**
 * App启动选项
 *  T 为框架组件类型（vue为Component）
 */
export interface AppStartOptions<T = any> {
  el: Element | string
  root?: T
  layout?: T
  config?: AppConfig
  extends?: AppExtends
}

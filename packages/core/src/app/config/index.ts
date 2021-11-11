import type { WidgetConfig } from './widgets'

/** App配置选项 */
export interface AppConfig {
  app?: GenericObject
  widgets?: WidgetConfig
  [prop: string]: any
}

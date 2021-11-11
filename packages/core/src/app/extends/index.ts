import type { Widget } from '../../widget'
import type { Plugin } from '../../plugin'

/** App扩展选项 */
export interface AppExtends {
  widgets?: Widget[] // 扩展微件
  plugins?: Plugin[] // 扩展插件
  [prop: string]: any
}

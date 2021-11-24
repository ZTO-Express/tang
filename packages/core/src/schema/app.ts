import type { Schema } from './base'

/** Appschema */
export interface AppSchema extends Schema {
  type: 'app'
  name: string // 应用名称
  logo?: string // logo地址
}

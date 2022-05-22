import type { PartialSchema, Schema } from './base'

/** Appschema */
export interface AppSchema extends Schema {
  type: 'app'
}

export type PartialAppSchema = PartialSchema<AppSchema>

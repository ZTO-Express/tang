/** 基础schema */
export interface Schema {
  type: string
  [prop: string]: any
}

export type PartialSchema<T extends Schema = Schema> = Omit<T, 'type'>

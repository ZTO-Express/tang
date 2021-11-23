/**
 * 自定义全局类型
 */

export type Nil = undefined | null

export type GenericFunction<T = any> = (...args: any[]) => T

export type PromiseFunction<T = any> = GenericFunction<Promise<T>>

// 特定类型对象
export interface GenericObject<T = any> {
  [key: string]: T
}

// 数据比对对象
export type SortCompareFunction<T = any> = (a: T, b: T) => number

// 日期值类型
export type DateValue = Date | string | number

/**
 * 自定义全局类型
 */

type Nil = undefined | null

type GenericFunction<T = any> = (...args: any[]) => T

type PromiseFunction<T = any> = GenericFunction<Promise<T>>

// 特定类型对象
interface GenericObject<T = any> {
  [key: string]: T
}

// 数据比对对象
type SortCompareFunction<T = any> = (a: T, b: T) => number

// 日期值类型
type DateValue = Date | string | number

type ExtractPublicPropTypes<T> = Omit<
  Partial<ExtractPropTypes<T>>,
  themePropKeys | Extract<keyof T, `internal${string}`>
>

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends GenericFunction ? K : never
}[keyof T]

// 动态导入模块
interface ImportMeta {
  glob: (module: string) => Record<string, any>
  globEager: (module: string) => Record<string, any>
}

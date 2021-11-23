/**
 * 自定义全局类型
 */

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends GenericFunction ? K : never
}[keyof T]

// 动态导入模块
interface ImportMeta {
  glob: (module: string) => Record<string, any>
  globEager: (module: string) => Record<string, any>
}

/**
 * 通用方法
 */
type GenericFunction<T = any> = (...args: any[]) => T

// 动态导入模块
interface ImportMeta {
  glob: (module: string) => Record<string, any>
  globEager: (module: string) => Record<string, any>
}

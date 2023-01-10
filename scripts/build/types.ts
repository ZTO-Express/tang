import type { OutputOptions as RollupOutputOptions } from 'rollup'
import type { CompilerOptions } from 'ts-morph'

/**
 * 构建配置
 */
export interface BuildConfig {
  /** 构建目标名称 */
  targetName: string

  /** 打包名称 */
  packageName: string

  /** 包根目录 */
  pkgRoot: string

  /**
   * 构建类型: schema
   */
  buildType?: string

  /** 入库文件名 */
  entryFileName?: string

  /** 输入目录 */
  inputDir: string

  /** 输入 */
  input: string

  /** 输出目录 */
  outDir: string

  /** 是否生成类型，默认不生成 */
  genTypes?: boolean

  /** 类型文件输入目录 */
  inputTypesDir: string

  /** 类型文件输出目录 */
  outTypesDir: string

  /** 是否生成schema，默认生成 */
  genSchemas?: boolean

  /** schem文件输出目录 */
  outSchemasDir?: string

  /** schema构建相关配置 */
  schema?: SchemaBuildConfig

  /** 是否生成浏览器代码 */
  genForBrowser?: boolean

  /** 浏览器构建相关配置 */
  browser?: BrowserBuildConfig

  /** ts构建相关配置 */
  tsconfig?: TsBuildConfig

  /** rollup构建相关配置 */
  rollup?: RollupBuildConfig

  /** 便已完成触发方法 */
  afterCompiled?: Function
}

/** schema构建相关配置 */
export interface SchemaBuildConfig {}

/** rollup构建相关配置 */
export interface RollupBuildConfig {
  /** 输入文件 */
  input?: string

  /** 是否压缩 */
  minify?: boolean

  // 内置库名称
  internal?: string[]

  // 接口相关配置
  plugins?: {
    replace?: Record<string, string>
    [prop: string]: any
  }
}

/** 浏览器构建相关配置 */
export interface BrowserBuildConfig {
  // 外置库名称
  external?: string[]

  /** 输出配置 */
  output?: RollupOutputOptions
}

/** ts构建相关配置 */
export interface TsBuildConfig {
  compilerOptions: CompilerOptions
}

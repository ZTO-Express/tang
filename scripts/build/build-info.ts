import { ZPAGE_PKG } from './utils/constants'

import type { ModuleFormat } from 'rollup'

export const modules = ['esm', 'cjs', 'cjs_prod'] as const
export type Module = typeof modules[number]
export interface BuildInfo {
  module: 'ESNext' | 'CommonJS'
  format: ModuleFormat
  ext: 'mjs' | 'js' | 'esm.js' | 'cjs.js' | 'cjs.prod.js'
  minify?: boolean
  output: {
    /** e.g: `es` */
    name: string
    /** e.g: `dist/zpage/es` */
    path?: string
  }
  bundle: {
    path: string
  }
}

export const buildConfig: Record<Module, BuildInfo> = {
  esm: {
    module: 'ESNext',
    format: 'esm',
    ext: 'esm.js',
    output: {
      name: 'es'
    },
    bundle: {
      path: `${ZPAGE_PKG}/es`
    }
  },
  cjs: {
    module: 'CommonJS',
    format: 'cjs',
    ext: 'cjs.js',
    output: {
      name: 'lib'
    },
    bundle: {
      path: `${ZPAGE_PKG}/lib`
    }
  }
  // 暂不考虑压缩
  // cjs_prod: {
  //   minify: true,
  //   module: 'CommonJS',
  //   format: 'cjs',
  //   ext: 'cjs.prod.js',
  //   output: {
  //     name: 'lib'
  //   },
  //   bundle: {
  //     path: `${ZPAGE_PKG}/lib`
  //   }
  // }
}
export const buildConfigEntries = Object.entries(buildConfig) as BuildConfigEntries

export type BuildConfig = typeof buildConfig
export type BuildConfigEntries = [Module, BuildInfo][]

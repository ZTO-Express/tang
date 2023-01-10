import { ZPAGE_PKG } from './utils/constants'

import type { ModuleFormat } from 'rollup'

// export const modules = ['esm', 'cjs', 'cjs_prod'] as const
export const modules = ['esm', 'cjs'] as const
export type Module = typeof modules[number]

export interface BuildInfo {
  module: 'ESNext' | 'CommonJS'
  format: ModuleFormat
  ext: 'mjs' | 'js' | 'esm.js' | 'cjs.js' | 'browser.js' | 'cjs.prod.js'
  minify?: boolean
  output: {
    /** e.g: `es` */
    name: string
    /** e.g: `dist/zpage/es` */
    path?: string
  }
  bundle: { path: string }
}

export const buildInfoConfig: Record<Module, BuildInfo> = {
  esm: {
    module: 'ESNext',
    format: 'esm',
    ext: 'esm.js',
    output: { name: 'es' },
    bundle: { path: `${ZPAGE_PKG}/es` }
  },

  cjs: {
    module: 'CommonJS',
    format: 'cjs',
    ext: 'cjs.js',
    output: { name: 'lib' },
    bundle: {
      path: `${ZPAGE_PKG}/lib`
    }
  }

  // 暂不考虑压缩(太耗时间，应用时不方便调试，实际项目一般会自带压缩)
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

export const buildInfoConfigEntries = Object.entries(buildInfoConfig) as BuildInfoConfigEntries

export type BuildInfoConfigEntries = [Module, BuildInfo][]

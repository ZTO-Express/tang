import { compileUI } from './compile-ui'

import type { BuildConfig } from '../types'

/** 编译Base库 */
export async function compileBase(buildConfig: BuildConfig) {
  if (!buildConfig.entryFileName) {
    buildConfig.entryFileName = `zpage-${buildConfig.targetName}`
  }

  const compilerOptions = {
    baseUrl: buildConfig.pkgRoot,
    outDir: buildConfig.outTypesDir,
    ...buildConfig?.tsconfig?.compilerOptions
  }

  await compileUI({
    ...buildConfig,
    tsconfig: {
      ...buildConfig?.tsconfig,
      compilerOptions
    }
  })
}

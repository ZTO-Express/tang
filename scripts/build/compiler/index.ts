import { isSitePkg } from '../utils/paths'
import { compileLib } from './compile-lib'
import { compileUI } from './compile-ui'
import { compileBase } from './compile-base'
import { compileSite } from './compile-site'

import type { BuildConfig } from '../types'

/**
 * 执行编译
 * @param buildConfig
 */
export async function compile(buildConfig: BuildConfig) {
  let compileFn = compileLib

  const { packageName } = buildConfig

  if (packageName.startsWith('ui-')) {
    compileFn = compileUI
  } else if (packageName.endsWith('-base')) {
    compileFn = compileBase
  } else if (isSitePkg(packageName)) {
    compileFn = compileSite
  }

  await compileFn(buildConfig)

  if (buildConfig.afterCompiled) {
    await buildConfig.afterCompiled(buildConfig)
  }
}

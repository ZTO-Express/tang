import { compileLib } from './compile-lib'
import { compileUI } from './compile-ui'
import { compileBase } from './compile-base'

export async function compile(buildConfig: any) {
  let compileFn = compileLib

  const packageName = buildConfig.packageName

  if (packageName.startsWith('ui-')) {
    compileFn = compileUI
  } else if (packageName.endsWith('-base')) {
    compileFn = compileBase
  }

  await compileFn(buildConfig)

  if (buildConfig.afterCompiled) {
    await buildConfig.afterCompiled(buildConfig)
  }
}

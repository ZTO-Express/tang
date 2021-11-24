import { compileLib } from './compile-lib'
import { compileUI } from './compile-ui'

export async function compile(buildConfig: any) {
  let compileFn = compileLib

  const packageName = buildConfig.packageName

  if (packageName.startsWith('ui-')) {
    compileFn = compileUI
  }

  await compileFn(buildConfig)

  if (buildConfig.afterCompiled) {
    await buildConfig.afterCompiled(buildConfig)
  }
}

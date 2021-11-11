import { compileLib } from './compile-lib'
import { compileUI } from './compile-ui'

export async function compile(packageName: string) {
  let compileFn = compileLib

  if (packageName.startsWith('ui-')) {
    compileFn = compileUI
  }

  await compileFn(packageName)
}

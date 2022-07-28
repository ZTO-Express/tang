import { compileUI } from './compile-ui'

/** 编译Base库 */
export async function compileBase(buildConfig: any) {
  if (!buildConfig.entryFileName) {
    buildConfig.entryFileName = `zpage-${buildConfig.targetName}`
  }

  const compilerOptions = {
    baseUrl: buildConfig.pkgRoot,
    outDir: buildConfig.outTypesDir,
    ...buildConfig.compilerOptions
  }

  await compileUI({
    ...buildConfig,
    compilerOptions
  })
}

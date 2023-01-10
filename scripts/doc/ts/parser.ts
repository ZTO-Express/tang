import { resolve } from 'path'

import { generateSchemas } from '../../schema'
import { resolvePkgRoot } from '../../build/utils/paths'

parser()

/**
 * 解析文件
 */
export async function parser() {
  const targetName = 'ui-element'

  const pkgRoot = resolvePkgRoot(targetName)

  const outDir = resolve(pkgRoot, 'dist')
  const outSchemasDir = resolve(outDir, 'schemas')

  await generateSchemas(pkgRoot, {
    compilerOptions: {
      outDir: outSchemasDir
    }
  })
}

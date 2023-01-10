import { resolve } from 'path'
import fse from 'fs-extra'

import * as log from '../utils/log'
import { generateJsonSchema } from '../../schema'

import type { BuildConfig } from '../types'

/** 编译库 */
export async function compileSite(buildConfig: BuildConfig) {
  // 生成Schema默认生成
  if (buildConfig.genSchemas !== false) {
    await _generateSchema(buildConfig)
  }
}

// 生成Schema
async function _generateSchema(buildConfig: BuildConfig) {
  const { pkgRoot, outDir } = buildConfig

  // 输出目录
  const outSchemasDir = buildConfig.outSchemasDir || resolve(pkgRoot, 'schemas')

  // 输出路径
  const schemaFileName = `index.json`
  const outputFilePath = resolve(outSchemasDir, schemaFileName)

  // 生成schema对象
  const jsonSchema = await generateJsonSchema(pkgRoot, buildConfig.schema)

  await fse.ensureDir(outSchemasDir)

  await fse.writeJSON(outputFilePath, jsonSchema, {
    spaces: 2
  })

  console.log(`${log.chalk.cyan('生成schema')}: ${schemaFileName}`)
}

import { resolve } from 'path'
import { compile } from './compiler'
import { readBuildConfig } from './utils/config'
import * as log from './utils/log'
import * as argv from './utils/argv'
import { resolvePkgRoot } from './utils/paths'

build()

// 执行构建
async function build() {
  log.cyan('构建开始...')

  const targetNameStr = argv.parseByName('name')

  if (!targetNameStr) {
    log.yellow('没有编码名称，请添加--name参数.')
    return
  }

  const targetNames = targetNameStr.split(',')

  for (const it of targetNames) {
    await buildByTargetName(it)
  }

  process.exit()
}

async function buildByTargetName(targetName: string) {
  if (!targetName) return

  log.cyan(`开始编译 ${targetName}`)

  // 准备配置文件
  const pkgRoot = resolvePkgRoot(targetName)
  const outDir = resolve(pkgRoot, 'dist')
  const outTypesDir = resolve(outDir, 'types')

  const inputDir = resolve(pkgRoot, 'src')
  const inputTypesDir = resolve(inputDir, 'typings')
  const inputFile = resolve(inputDir, 'index.ts')

  const buildConfig = await readBuildConfig(pkgRoot, '', {})

  try {
    await compile({
      pkgRoot,
      outDir,
      outTypesDir,
      inputDir,
      inputTypesDir,
      input: inputFile,
      ...buildConfig,
      packageName: targetName
    })

    log.green(`${targetName} 编译完成`)
  } catch (err: any) {
    log.errorAndExit(err)
  }
}

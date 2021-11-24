import { resolve } from 'path'
import { compile } from './compiler'
import { readBuildConfig } from './utils/config'
import * as log from './utils/log'
import { resolvePkgRoot } from './utils/paths'

build()

// 执行构建
async function build() {
  log.cyan('构建开始...')

  const argv = process.argv

  const nameArgPrefix = '--name='
  const nameArg = argv.find(arg => arg.startsWith(nameArgPrefix))

  const nameStr = nameArg?.substr(nameArgPrefix.length)

  if (!nameStr) {
    log.yellow('没有编码名称，请添加--name参数.')
    return
  }

  const names = nameStr.split(',')

  for (const it of names) {
    await buildByName(it)
  }

  process.exit()
}

async function buildByName(name: string) {
  if (!name) return

  log.cyan(`开始编译 ${name}`)

  // 准备配置文件
  const pkgRoot = resolvePkgRoot(name)
  const outDir = resolve(pkgRoot, 'dist')
  const outTypesDir = resolve(outDir, 'types')

  const inputDir = resolve(pkgRoot, 'src')
  const inputTypesDir = resolve(inputDir, 'typings')
  const inputFile = resolve(inputDir, 'index.ts')

  const buildConfig = await readBuildConfig(pkgRoot, '', {})

  buildConfig.packageName = name
  buildConfig.pkgRoot = buildConfig.pkgRoot || pkgRoot

  buildConfig.outDir = buildConfig.outDir || outDir
  buildConfig.outTypesDir = buildConfig.outTypesDir || outTypesDir

  buildConfig.inputDir = buildConfig.inputDir || inputDir
  buildConfig.inputTypesDir = buildConfig.inputTypesDir || inputTypesDir
  buildConfig.input = buildConfig.input || inputFile

  try {
    await compile(buildConfig)

    log.green(`${name} 编译完成`)
  } catch (err) {
    log.errorAndExit(err)
  }
}

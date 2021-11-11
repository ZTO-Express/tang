import path from 'path'
import rimraf from 'rimraf'
import { compile } from './compiler'
import * as log from './utils/log'

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
  const libDir = path.join(__dirname, 'packages', name, '../lib')
  log.cyan(`删除旧库文件: ${libDir}`)
  rimraf.sync(libDir)

  log.cyan(`正在编译 ${name}`)

  try {
    await compile(name)
    log.green(`${name} 编译完成`)
  } catch (err) {
    log.errorAndExit(err)
  }
}

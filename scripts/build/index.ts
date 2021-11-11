import path from 'path'
// import ora from 'ora'
import rimraf from 'rimraf'
import { compile } from './compiler'

// const spinner = ora()

debugger

build()

// 执行构建
async function build() {
  console.log('构建开始...')

  const argv = process.argv

  const nameArgPrefix = '--name='
  const nameArg = argv.find(arg => arg.startsWith(nameArgPrefix))

  const nameStr = nameArg?.substr(nameArgPrefix.length)

  if (!nameStr) {
    // spinner.fail('没有编码名称，请添加--name参数.')
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

  // spinner.succeed(`开始编译 ${name}`)
  const libDir = path.join(__dirname, 'packages', name, '../lib')
  // spinner.succeed(`删除旧库文件: ${libDir}`)
  rimraf.sync(libDir)

  // spinner.succeed(`正在编译 ${name}`)

  try {
    await compile(name)
    // spinner.succeed(`${name} 编译完成`)
  } catch (err) {
    console.log('构建失败...', err)
    // spinner.fail(`${name} 编译失败`)
    // throw err
  }
}

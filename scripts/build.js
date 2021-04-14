const path = require('path')
const fs = require('fs-extra')
const rimraf = require('rimraf')
const ora = require('ora');

const { compile } = require('./compile')

const spinner = ora();

build()

// 执行构建
async function build() {
  const argv = process.argv

  const nameArgPrefix = '--name='
  const nameArg = argv.find(arg => arg.startsWith(nameArgPrefix))

  const nameStr = nameArg.substr(nameArgPrefix.length)

  if(!nameStr) {
    spinner.stop('没有编码名称，请添加--name参数.')
    return
  }

  const names = nameStr.split(',')

  for(it of names) {
    await buildByName(it)
  }

  process.exit();
}

async function buildByName(name) {
  if (!name) return

  spinner.succeed(`开始编译 ${name} 模块...`);

  const libDir =path.join(__dirname, 'packages', name,'../lib')

  spinner.succeed(`删除旧库文件: ${libDir}`);
  
  rimraf.sync(libDir)

  spinner.succeed(`正在编译 ${name} 模块...`);

  const configFile = path.join(__dirname, '../packages', name, 'tsconfig.build.json')

  try {
    compile(configFile)
    spinner.succeed(`${name} 模块编译完成`)
  } catch(err) {
    spinner.fail(`${name} 模块编译失败`)
    throw err
  }
}

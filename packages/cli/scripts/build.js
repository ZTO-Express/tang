const path = require('path')
const fs = require('fs-extra')
const rimraf = require('rimraf')
const ora = require('ora');

const { compile } = require('./compile')

async function build() {
  const libDir =path.join(__dirname,'../lib')

  const spinner = ora().start(`删除旧库文件: ${libDir}`);
  
  rimraf.sync(libDir)
  spinner.succeed()

  spinner.start(`正在执行编译...`);
  compile('tsconfig.build.json')
  spinner.succeed('编译完成')

  process.exit();
}

build()

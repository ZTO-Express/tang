/** 解析命令行参数 */
export function parseByName(name: string) {
  if (!name) throw new Error('请提供参数名称')

  const argPrefix = `--${name}=`

  const argStr = process.argv.find(arg => arg.startsWith(argPrefix))

  const argv = argStr?.substring(argPrefix.length)
  return argv
}

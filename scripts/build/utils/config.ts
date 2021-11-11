import path from 'path'
import fse from 'fs-extra'

/** 读取构建配置 */
export function readBuildConfig(pkgDir: string, section?: string) {
  const configFilePath = path.resolve(pkgDir, 'build.config.js')

  if (!fse.existsSync(configFilePath)) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require(configFilePath) as any

  if (config && section) return config[section]
  return config
}

import path from 'path'
import fse from 'fs-extra'

import type { BuildConfig } from '../types'

/** 读取构建配置 */
export function readBuildConfig<T = any>(pkgDir: string, section?: string, defalutValue: any = null): T {
  const configFilePath = path.resolve(pkgDir, 'build.config.js')

  if (!fse.existsSync(configFilePath)) {
    return defalutValue
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require(configFilePath) as any

  if (config && section) return config[section] || defalutValue
  return config || defalutValue
}

import { resolve } from 'path'

export const PackageJsonFileName = 'package.json'

export const projRoot = resolve(__dirname, '..', '..', '..')
export const pkgRoot = resolve(projRoot, 'packages')

/** 是否站点包 */
export const isSitePkg = (name: string) => {
  if (!name) return false
  return name === 'site' || name.endsWith('-site')
}

/** 获取指定包根目录 */
export const resolvePkgRoot = (name: string) => {
  if (isSitePkg(name)) return resolve(projRoot, name)
  return resolve(pkgRoot, name)
}
export const resolvePkgJson = (name: string) => resolve(pkgRoot, name, PackageJsonFileName)
export const resolveProjRoot = (name: string) => resolve(projRoot, name)
export const resolveProjJson = (name: string) => resolve(projRoot, name, PackageJsonFileName)

export const coreRoot = resolvePkgRoot('core')
export const runtimeRoot = resolvePkgRoot('runtime')

export const typingsRoot = resolveProjRoot('typings')
export const sampleRoot = resolveProjRoot('sample')
export const docRoot = resolveProjRoot('docs')
export const siteRoot = resolveProjRoot('site')

export const projPackage = resolve(projRoot, PackageJsonFileName)

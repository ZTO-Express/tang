import { resolve } from 'path'

export const projRoot = resolve(__dirname, '..', '..', '..')
export const pkgRoot = resolve(projRoot, 'packages')

export const resolvePkgRoot = (name: string) => resolve(pkgRoot, name)
export const resolvePkgJson = (name: string) => resolve(pkgRoot, name, 'package.json')
export const resolveProjRoot = (name: string) => resolve(projRoot, name)
export const resolveProjJson = (name: string) => resolve(projRoot, name, 'package.json')

export const coreRoot = resolvePkgRoot('core')
export const ffbRoot = resolvePkgRoot('ffb')
export const runtimeRoot = resolvePkgRoot('runtime')

export const typingsRoot = resolveProjRoot('typings')
export const sampleRoot = resolveProjRoot('sample')
export const docRoot = resolveProjRoot('docs')
export const siteRoot = resolveProjRoot('site')

export const projPackage = resolve(projRoot, 'package.json')

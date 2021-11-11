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
export const uiElementRoot = resolvePkgRoot('ui-element')
export const uiVantRoot = resolvePkgRoot('ui-vant')
export const zpageRoot = resolvePkgRoot('zpage')

export const typingsRoot = resolveProjRoot('typings')
export const sampleRoot = resolveProjRoot('sample')
export const docRoot = resolveProjRoot('docs')
export const siteRoot = resolveProjRoot('site')

/** dist */
export const buildOutput = resolveProjRoot('dist')

/** dist/zpage */
export const zpageOutput = resolve(buildOutput, 'zpage')

export const projPackage = resolve(projRoot, 'package.json')

export const samplePackage = resolve(sampleRoot, 'package.json')
export const docPackage = resolve(docRoot, 'package.json')
export const sitePackage = resolve(siteRoot, 'package.json')

export const corePackage = resolve(coreRoot, 'package.json')
export const ffbPackage = resolve(ffbRoot, 'package.json')
export const runtimePackage = resolve(runtimeRoot, 'package.json')
export const uiElementPackage = resolve(uiElementRoot, 'package.json')
export const uiVantPackage = resolve(uiVantRoot, 'package.json')
export const zpagePackage = resolve(zpageRoot, 'package.json')

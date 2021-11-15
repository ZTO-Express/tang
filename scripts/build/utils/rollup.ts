import path from 'path'
import { zpagePackage } from './paths'
import { getPackageDependencies } from './pkg'

import type { OutputOptions, RollupBuild } from 'rollup'

export const generateExternal = async (options: {
  full: boolean
  pkgRoot: string
  internal: string[]
}) => {
  const pkgPath = options?.pkgRoot ? path.resolve(options.pkgRoot, 'package.json') : zpagePackage
  const packages: string[] = ['vue', 'vuex', 'vue-router', 'qs', 'axios']
  if (!options.full) {
    // dependencies
    packages.push('@vue', ...getPackageDependencies(pkgPath))
  }

  const internal = options.internal || []
  const externelPackages: string[] = [
    ...new Set(packages.filter(it => it && !internal.includes(it)))
  ]

  return (id: string) => {
    return externelPackages.some(pkg => id === pkg || id.startsWith(`${pkg}/`))
  }
}

export function writeBundles(bundle: RollupBuild, options: OutputOptions[]) {
  return Promise.all(options.map(option => bundle.write(option)))
}

import path from 'path'
import { zpagePackage } from './paths'
import { getPackageDependencies } from './pkg'

import type { OutputOptions, RollupBuild } from 'rollup'

export const generateExternal = async (options: { full: boolean; pkgRoot: string }) => {
  const pkgPath = options?.pkgRoot ? path.resolve(options.pkgRoot, 'package.json') : zpagePackage
  return (id: string) => {
    const packages: string[] = ['vue', 'vuex', 'vue-router', 'qs', 'axios']
    if (!options.full) {
      // dependencies
      packages.push('@vue', ...getPackageDependencies(pkgPath))
    }

    return [...new Set(packages)].some(pkg => id === pkg || id.startsWith(`${pkg}/`))
  }
}

export function writeBundles(bundle: RollupBuild, options: OutputOptions[]) {
  return Promise.all(options.map(option => bundle.write(option)))
}

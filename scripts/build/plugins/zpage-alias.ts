import { ZPAGE_PREFIX } from '../utils/constants'
import { getDistPackages } from '../utils/pkg'

import type { Plugin } from 'rollup'

export async function ZPageAlias(): Promise<Plugin> {
  const pkgs = await getDistPackages()

  return {
    name: 'zpage-alias-plugin',
    resolveId(id, importer, options) {
      if (!id.startsWith(ZPAGE_PREFIX)) return

      let updatedId = id
      for (const pkg of pkgs) {
        if (id.startsWith(pkg.name)) updatedId = updatedId.replace(pkg.name, pkg.dir)
      }
      return this.resolve(id, importer, { skipSelf: true, ...options })
    }
  }
}

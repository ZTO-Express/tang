import { transform } from './core'

import type { Plugin } from 'rollup'
import type { CleanOptions } from './core'

interface PluginOptions {
  clean?: CleanOptions
}

export function VueTypeImports(options: PluginOptions = {}): Plugin {
  const clean = options.clean ?? {}

  return {
    name: 'vue-type-imports-plugin',

    async transform(code, id) {
      if (!/\.(vue)$/.test(id)) return

      const transformedCode = await transform(code, { id, aliases: undefined, clean })

      return { code: transformedCode }
    }
  }
}

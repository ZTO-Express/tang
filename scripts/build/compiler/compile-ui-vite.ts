import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { generateExternal } from '../utils/rollup'

const vite = require('vite')

/** 编译库 */
export async function compileUI(buildConfig: any) {
  buildConfig.entryFileName = `zpage-${buildConfig.packageName}`

  await _viteCompile(buildConfig)
}

// vite打包
async function _viteCompile(buildConfig: any) {
  const pkgRoot = buildConfig.pkgRoot
  const buildRoollupConfig = buildConfig.rollup

  const entry = resolve(pkgRoot, 'src', 'index.ts')

  const externalOptions = await generateExternal({
    full: false,
    pkgRoot,
    internal: buildRoollupConfig.internal || []
  })

  await vite.build({
    build: {
      lib: {
        entry,
        name: 'ZPageElementUI',
        fileName: format => `${buildConfig.entryFileName}.${format}.js`
      },
      rollupOptions: {
        external: externalOptions,
        output: {}
      }
    },
    plugins: [vue()]
  })
}

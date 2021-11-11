import { resolve } from 'path'
import fs from 'fs-extra'
import { rollup } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import filesize from 'rollup-plugin-filesize'

import { ZPAGE_PKG } from '../utils/constants'
import { resolvePkgRoot } from '../utils/paths'
import { generateExternal, writeBundles } from '../utils/rollup'
import { generateTypesDefinitions } from '../utils/dts'
import { readBuildConfig } from '../utils/config'

import { reporter } from '../plugins/size-reporter'
import { buildConfigEntries } from '../build-info'

import type { BuildConfigEntries } from '../build-info'
import type { OutputOptions, RollupOptions, RollupBuild } from 'rollup'

/** 编译库 */
export async function compileLib(packageName: string) {
  await _compile(packageName)

  await _generateDts(packageName)
}

// 生成类型文件
async function _generateDts(packageName: string) {
  const pkgRoot = resolvePkgRoot(packageName)

  const isGenTypes = await readBuildConfig(pkgRoot, 'genTypes')
  if (isGenTypes === false) return

  // 生成类型文件
  await generateTypesDefinitions(pkgRoot, {
    compilerOptions: {
      baseUrl: pkgRoot,
      outDir: resolve(pkgRoot, 'dist', 'types'),
      paths: {
        '@zpage/*': ['packages/*']
      }
    }
  })
}

async function _compile(packageName: string) {
  const pkgRoot = resolvePkgRoot(packageName)

  const input = resolve(pkgRoot, 'src', 'index.ts')
  const externalOptions = await generateExternal({ full: false, pkgRoot })

  const rollupConfig: RollupOptions = {
    input,
    external: externalOptions
  }

  const buildRoollupConfig = readBuildConfig(pkgRoot, 'rollup')

  // 常用应用
  const entries = buildConfigEntries.filter(it => !it[1]?.minify)
  console.log('entries --->', entries.length)
  if (entries?.length) {
    const bundle = await rollup(
      getRollupOptions(rollupConfig, {
        rollup: buildRoollupConfig
      })
    )

    // 先清理输出目录
    const outPutDir = resolve(pkgRoot, 'dist')
    await fs.remove(outPutDir)

    await _writeBundles(bundle, entries, packageName)
  }

  // 压缩版应用
  const minifyEntries = buildConfigEntries.filter(it => it[1]?.minify === true)
  console.log('minifyEntries --->', minifyEntries.length)
  if (minifyEntries?.length) {
    const bundle = await rollup(
      getRollupOptions(rollupConfig, {
        minify: true,
        rollup: buildRoollupConfig
      })
    )
    await _writeBundles(bundle, minifyEntries, packageName)
  }
}

/**
 * 获取rollup选项
 * @param options
 * @param minify
 * @returns
 */
function getRollupOptions(
  options: Partial<RollupOptions>,
  exOptions: {
    minify?: boolean
    rollup?: any
  }
) {
  const esbuildOptions: any = { target: 'chrome58' }

  const isMinify = exOptions.minify
  const exRollupConfig = exOptions.rollup || {}

  if (isMinify === true) {
    esbuildOptions.minify = true
  }

  const pluginsConfig = exRollupConfig.plugins || {}
  const esbuildConfig = { ...esbuildOptions, ...pluginsConfig.esbuild }

  const rollupConfig: RollupOptions = Object.assign(
    {
      plugins: [
        nodeResolve({
          extensions: ['.mjs', '.js', '.json', '.ts']
        }),
        commonjs(),
        esbuild(esbuildConfig),
        filesize({ reporter })
      ],
      treeshake: false
    },
    options
  )

  return rollupConfig
}

async function _writeBundles(
  bundle: RollupBuild,
  entries: BuildConfigEntries,
  packageName: string
) {
  const pkgRoot = resolvePkgRoot(packageName)

  const outPutDir = resolve(pkgRoot, 'dist')
  const preserveModulesRoot = resolve(pkgRoot, 'src')

  let entryFileName = `zpage-${packageName}`
  if ('zpage' === packageName) entryFileName = packageName

  await writeBundles(
    bundle,
    entries.map(([module, config]): OutputOptions => {
      return {
        format: config.format,
        dir: outPutDir,
        exports: module === 'cjs' ? 'named' : undefined,
        preserveModules: false,
        preserveModulesRoot,
        sourcemap: false,
        entryFileNames: `${entryFileName}.${config.ext}`
      }
    })
  )
}

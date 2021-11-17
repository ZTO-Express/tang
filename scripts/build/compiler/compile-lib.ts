import path from 'path'
import fse from 'fs-extra'
import { rollup } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import filesize from 'rollup-plugin-filesize'

import { generateExternal, writeBundles } from '../utils/rollup'
import { generateTypesDefinitions } from '../utils/dts'

import { reporter } from '../plugins/size-reporter'
import { buildConfigEntries } from '../build-info'

import type { BuildConfigEntries } from '../build-info'
import type { OutputOptions, RollupOptions, RollupBuild } from 'rollup'

/** 编译库 */
export async function compileLib(buildConfig: any) {
  await _compile(buildConfig)

  await _generateDts(buildConfig)
}

// 生成类型文件
async function _generateDts(buildConfig: any) {
  if (buildConfig.genTypes === false) return

  const pkgRoot = buildConfig.pkgRoot
  const outTypesDir = buildConfig.outTypesDir
  const inputTypesDir = buildConfig.inputTypesDir

  // 生成类型文件
  await generateTypesDefinitions(pkgRoot, {
    compilerOptions: {
      baseUrl: pkgRoot,
      outDir: outTypesDir,
      paths: {
        '@zpage/*': ['packages/*']
      }
    }
  })

  if (fse.pathExistsSync(inputTypesDir)) {
    const outputBaseName = path.basename(inputTypesDir)
    const outputTypesDir = path.resolve(outTypesDir, outputBaseName)

    console.log(`复制类型文件: ${inputTypesDir} --> ${outputTypesDir}`)

    await fse.copy(inputTypesDir, outputTypesDir)
  }
}

async function _compile(buildConfig: any) {
  const pkgRoot = buildConfig.pkgRoot
  const buildRoollupConfig = buildConfig.rollup || {}
  const input = buildRoollupConfig.input || buildConfig.input

  const externalOptions = await generateExternal({
    full: false,
    pkgRoot,
    internal: buildRoollupConfig.internal || []
  })

  const rollupConfig: RollupOptions = {
    input,
    external: externalOptions
  }

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
    await fse.remove(buildConfig.outDir)

    await _writeBundles(bundle, entries, buildConfig)
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
    await _writeBundles(bundle, minifyEntries, buildConfig)
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

async function _writeBundles(bundle: RollupBuild, entries: BuildConfigEntries, buildConfig: any) {
  const packageName = buildConfig.packageName

  let entryFileName = `zpage-${packageName}`
  if ('zpage' === packageName) entryFileName = packageName

  await writeBundles(
    bundle,
    entries.map(([module, config]): OutputOptions => {
      return {
        format: config.format,
        dir: buildConfig.outDir,
        exports: module === 'cjs' ? 'named' : undefined,
        preserveModules: false,
        preserveModulesRoot: buildConfig.inputDir,
        sourcemap: false,
        entryFileNames: `${entryFileName}.${config.ext}`
      }
    })
  )
}

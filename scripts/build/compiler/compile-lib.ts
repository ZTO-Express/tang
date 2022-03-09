import path from 'path'
import fse from 'fs-extra'
import { rollup } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
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
  buildConfig.entryFileName = 'zpage' === buildConfig.packageName ? 'zpage' : `zpage-${buildConfig.packageName}`

  await _compile(buildConfig)

  if (buildConfig.browser) {
    await _compileBrowser(buildConfig)
    await _compileBrowser(buildConfig, true)
  }

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
    const _rollupOptions = getRollupOptions(rollupConfig, {
      rollup: buildRoollupConfig
    })
    const bundle = await rollup(_rollupOptions)

    // 先清理输出目录
    await fse.remove(buildConfig.outDir)

    await _writeBundles(bundle, entries, buildConfig)
  }

  // 压缩版应用
  const minifyEntries = buildConfigEntries.filter(it => it[1]?.minify === true)
  console.log('minifyEntries --->', minifyEntries.length)
  if (minifyEntries?.length) {
    const _rollupOptions = getRollupOptions(rollupConfig, {
      minify: true,
      rollup: buildRoollupConfig
    })

    const bundle = await rollup(_rollupOptions)
    await _writeBundles(bundle, minifyEntries, buildConfig)
  }
}

/** 浏览器压缩包编译 */
async function _compileBrowser(buildConfig: any, minify = false) {
  const buildRoollupConfig = buildConfig.rollup || {}
  const input = buildRoollupConfig.input || buildConfig.input

  const browserBuildConfig = buildConfig.browser || {}

  const extName = `browser${minify ? '.min' : ''}.js`

  const _rollupOptions = getRollupOptions(
    {
      input,
      external: browserBuildConfig.external || []
    },
    { minify, rollup: buildRoollupConfig }
  )
  const bundle = await rollup(_rollupOptions)

  const entryFileNames = `${buildConfig.entryFileName}.${extName}`

  // 先清理输出目录
  await fse.remove(path.join(buildConfig.outDir, entryFileNames))

  await writeBundles(bundle, [
    {
      format: 'iife',
      dir: buildConfig.outDir,
      exports: undefined,
      preserveModules: false,
      preserveModulesRoot: buildConfig.inputDir,
      sourcemap: false,
      entryFileNames: entryFileNames,
      ...browserBuildConfig.output
    }
  ])
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
  const exRollupConfig = exOptions.rollup || {}
  const pluginsConfig = exRollupConfig.plugins || {}
  const esbuildConfig = { target: 'chrome58', minify: exOptions.minify === true, ...pluginsConfig.esbuild }
  const replaceConfig = { ...pluginsConfig.replace }

  const rollupConfig: RollupOptions = {
    plugins: [
      nodeResolve({
        extensions: ['.mjs', '.js', '.json', '.ts']
      }),
      replace(replaceConfig),
      commonjs(),
      esbuild(esbuildConfig),
      filesize({ reporter })
    ],
    treeshake: false,
    ...options
  }

  return rollupConfig
}

async function _writeBundles(bundle: RollupBuild, entries: BuildConfigEntries, buildConfig: any) {
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
        entryFileNames: `${buildConfig.entryFileName}.${config.ext}`
      }
    })
  )
}

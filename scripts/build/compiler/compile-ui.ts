import { resolve } from 'path'
import fse from 'fs-extra'
import { rollup } from 'rollup'
import vue from 'rollup-plugin-vue'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import esbuild from 'rollup-plugin-esbuild'
import filesize from 'rollup-plugin-filesize'

import postcss from 'rollup-plugin-postcss'
import postcssImport from 'postcss-import'
import simplevars from 'postcss-simple-vars'
import nestedcss from 'postcss-nested'
import postcssUrl from 'postcss-url'
import autoprefixer from 'autoprefixer'

import { projRoot } from '../utils/paths'
import { generateExternal, writeBundles } from '../utils/rollup'
import { generateTypesDefinitions } from '../utils/dts'
import { readBuildConfig } from '../utils/config'

import { reporter } from '../plugins/size-reporter'
import { buildConfigEntries } from '../build-info'

import type { BuildConfigEntries } from '../build-info'
import type { OutputOptions, RollupOptions, RollupBuild } from 'rollup'

/** 编译库 */
export async function compileUI(buildConfig: any) {
  await _compile(buildConfig)
  await _generateDts(buildConfig)
}

// 生成类型文件
async function _generateDts(buildConfig: any) {
  if (buildConfig.genTypes === false) return

  const pkgRoot = buildConfig.pkgRoot
  const outTypesDir = buildConfig.outTypesDir
  const inputTypesDir = buildConfig.inputTypesDir

  await generateTypesDefinitions(pkgRoot, {
    compilerOptions: {
      baseUrl: pkgRoot,
      outDir: outTypesDir,
      paths: {
        '@zpage/*': ['packages/*'],
        '@zpage/zpage': ['packages/zpage']
      }
    }
  })

  if (fse.pathExistsSync(inputTypesDir)) {
    await fse.copyFile(inputTypesDir, outTypesDir)
  }
}

// 打包库
async function _compile(buildConfig: any) {
  const pkgRoot = buildConfig.pkgRoot
  const buildRoollupConfig = readBuildConfig(pkgRoot, 'rollup', {})

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

  // 先清理输出目录
  await fse.remove(buildConfig.outDir)

  // 常用应用
  const entries = buildConfigEntries.filter(it => !it[1]?.minify)
  console.log('entries --->', entries.length)
  if (entries?.length) {
    const bundle = await rollup(
      getRollupOptions(rollupConfig, {
        rollup: buildRoollupConfig
      })
    )
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
  const preVueConfig = []

  const postcssConfigList = [
    postcssImport({
      resolve(id, basedir) {
        if (id.startsWith('~')) {
          return resolve(projRoot, './node_modules', id.slice(1))
        }
        return resolve(basedir, id)
      }
    }),
    simplevars,
    nestedcss,
    postcssUrl({ url: 'inline' }),
    autoprefixer({
      overrideBrowserslist: '> 1%, IE 6, Explorer >= 10, Safari >= 7'
    })
  ]

  const vueConfig: any = {
    target: 'browser',
    preprocessStyles: true,
    postcssPlugins: [...postcssConfigList],
    ...pluginsConfig.vue
  }

  const postVueConfig = [
    postcss({
      modules: {
        generateScopedName: '[local]___[hash:base64:5]'
      },
      include: /&module=.*\.css$/
    }),
    postcss({ include: /(?<!&module=.*)\.css$/, plugins: [...postcssConfigList] })
  ]

  const rollupConfig: RollupOptions = Object.assign(
    {
      plugins: [
        ...preVueConfig,
        vue(vueConfig),
        ...postVueConfig,
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
        entryFileNames: `zpage-${packageName}.${config.ext}`
      }
    })
  )
}
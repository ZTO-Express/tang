import path, { resolve } from 'path'
import fse from 'fs-extra'
import glob from 'fast-glob'
import { rollup } from 'rollup'
import vue from 'rollup-plugin-vue'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import alias from '@rollup/plugin-alias'
import esbuild from 'rollup-plugin-esbuild'
import filesize from 'rollup-plugin-filesize'

import postcss from 'rollup-plugin-postcss'
import postcssImport from 'postcss-import'
import simplevars from 'postcss-simple-vars'
import nestedcss from 'postcss-nested'
import postcssUrl from 'postcss-url'
import autoprefixer from 'autoprefixer'

import { VueTypeImports } from '../plugins/vue-type-imports'

import * as log from '../utils/log'
import { projRoot } from '../utils/paths'
import { generateExternal, writeBundles } from '../utils/rollup'
import { generateTypesDefinitions } from '../utils/dts'
import { excludeFiles } from '../utils/pkg'
import { generateJsonSchema } from '../../schema'

import { reporter } from '../plugins/size-reporter'
import { buildInfoConfigEntries } from '../build-info'

import type { OutputOptions, RollupOptions, RollupBuild } from 'rollup'
import type { BuildInfoConfigEntries } from '../build-info'
import type { BrowserBuildConfig, BuildConfig } from '../types'

/** 编译库 */
export async function compileUI(buildConfig: BuildConfig) {
  buildConfig.entryFileName = `zpage-${buildConfig.packageName}`

  // 先清理输出目录
  await fse.remove(buildConfig.outDir)

  // 确认输出目录存在
  await fse.ensureDir(buildConfig.outDir)

  // 开始编译
  await _compile(buildConfig)

  // 生成Schema默认生成
  if (buildConfig.genSchemas !== false) {
    await _generateSchema(buildConfig)
  }

  // 生成浏览器端，默认不生成
  if (buildConfig.genForBrowser === true) {
    await _compileBrowser(buildConfig)
    await _compileBrowser(buildConfig, true)
  }

  // 生成类型, 默认不生成
  if (buildConfig.genTypes === true) {
    await _generateDts(buildConfig)
  }
}

// 生成Schema
async function _generateSchema(buildConfig: BuildConfig) {
  const { pkgRoot, outDir } = buildConfig

  // 输出目录
  const outSchemasDir = buildConfig.outSchemasDir || outDir

  // 输出路径
  const schemaFileName = `${buildConfig.entryFileName}.schema.json`
  const outputFilePath = resolve(outSchemasDir, schemaFileName)

  // 生成schema对象
  const jsonSchema = await generateJsonSchema(pkgRoot, buildConfig.schema)
  // const jsonSchema = await generateJsonSchema(pkgRoot, { type: '*' })

  await fse.ensureDir(outSchemasDir)

  await fse.writeJSON(outputFilePath, jsonSchema, {
    spaces: 2
  })

  console.log(`${log.chalk.cyan('生成schema')}: ${schemaFileName}`)
}

// 生成类型文件
async function _generateDts(buildConfig: BuildConfig) {
  const { pkgRoot, outTypesDir, inputTypesDir } = buildConfig

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
async function _compile(buildConfig: BuildConfig) {
  const pkgRoot = buildConfig.pkgRoot
  const buildRoollupConfig = buildConfig.rollup

  const input = buildRoollupConfig?.input || buildConfig.input
  const externalOptions = await generateExternal({
    full: false,
    pkgRoot,
    internal: buildRoollupConfig?.internal || []
  })

  const rollupConfig: RollupOptions = {
    input,
    external: externalOptions
  }

  // 常用应用
  const entries = buildInfoConfigEntries.filter(it => !it[1]?.minify)
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
  const minifyEntries = buildInfoConfigEntries.filter(it => it[1]?.minify === true)
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

/** 浏览器压缩包编译 */
async function _compileBrowser(buildConfig: BuildConfig, minify = false) {
  const buildRoollupConfig = buildConfig.rollup || {}
  const input = buildRoollupConfig.input || buildConfig.input

  const browserBuildConfig: BrowserBuildConfig = buildConfig.browser || {}

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
  const preVueConfig = []
  const replaceConfig = { ...pluginsConfig.replace }

  const postcssConfigList = [
    postcssImport({
      resolve(id, basedir) {
        if (id.startsWith('~')) {
          return path.resolve(projRoot, './node_modules', id.slice(1))
        }
        return path.resolve(basedir, id)
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

  const rollupConfig: RollupOptions = {
    plugins: [
      ...preVueConfig,
      VueTypeImports(),
      vue(vueConfig),
      ...postVueConfig,
      nodeResolve({ extensions: ['.mjs', '.js', '.json', '.ts'] }),
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

async function _writeBundles(bundle: RollupBuild, entries: BuildInfoConfigEntries, buildConfig: BuildConfig) {
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

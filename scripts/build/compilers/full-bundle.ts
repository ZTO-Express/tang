import path from 'path'
import { rollup } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import vue from 'rollup-plugin-vue'
import esbuild from 'rollup-plugin-esbuild'
import replace from '@rollup/plugin-replace'
import filesize from 'rollup-plugin-filesize'

import { ZPageAlias } from '../plugins/zpage-alias'

import { zpageRoot, zpageOutput } from '../utils/paths'
import { generateExternal, writeBundles } from '../utils/rollup'

import { version } from '../../../packages/zpage/version'

export const buildFull = (minify: boolean) => async () => {
  const bundle = await rollup({
    input: path.resolve(zpageRoot, 'index.ts'),
    plugins: [
      await ZPageAlias(),
      nodeResolve({
        extensions: ['.mjs', '.js', '.json', '.ts']
      }),
      vue({
        target: 'browser',
        exposeFilename: false
      }),
      commonjs(),
      esbuild({
        minify,
        sourceMap: minify,
        target: 'es2018'
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),

        // options
        preventAssignment: true
      }),
      filesize()
    ],
    external: await generateExternal({ full: true })
  })

  const banner = `/*! ZPage v${version} */\n`

  await writeBundles(bundle, [
    {
      format: 'umd',
      file: path.resolve(zpageOutput, `dist/index.full${minify ? '.min' : ''}.js`),
      exports: 'named',
      name: 'ZPage',
      globals: {
        vue: 'Vue'
      },
      sourcemap: minify,
      banner
    },
    {
      format: 'esm',
      file: path.resolve(zpageOutput, `dist/index.full${minify ? '.min' : ''}.mjs`),
      sourcemap: minify,
      banner
    }
  ])
}

import { resolve } from 'path'
import { defineConfig } from 'vite'
import createVuePlugin from '@vitejs/plugin-vue'
import { viteExternalsPlugin } from 'vite-plugin-externals'

const vuePlugin = createVuePlugin({ include: [/\.vue$/] })
const externalsPlugin = viteExternalsPlugin({
  vue: 'Vue',
  '@zto/zpage': 'ZPage',
  '@zto/zpage-ui-element': 'ZPageElementUI'
})

export default defineConfig(async () => {
  return {
    root: __dirname,
    plugins: [vuePlugin, externalsPlugin],
    resolve: {
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, './src')
        },
        {
          find: /~(.+)/,
          replacement: resolve(__dirname, 'node_modules/$1')
        }
      ],
      preserveSymlinks: false
    },
    build: {
      minify: false,
      outDir: './dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
          // project01: resolve(__dirname, 'prjs/project01/index.html'),
          // project02: resolve(__dirname, 'prjs/project02/index.html')
        }
      }
    },
    server: {
      host: '127.0.0.1',
      port: 4120
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "sass:math";
            @import "./src/styles/theme.scss";
          `
        }
      }
    },
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment'
    }
  }
})

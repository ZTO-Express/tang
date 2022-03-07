import { resolve } from 'path'
import { defineConfig } from 'vite'
import createVuePlugin from '@vitejs/plugin-vue'

const vuePlugin = createVuePlugin({ include: [/\.vue$/] })

export default defineConfig(async () => {
  return {
    root: __dirname,
    plugins: [vuePlugin],
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
      ]
    },
    build: {
      outDir: './dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          project01: resolve(__dirname, 'project01/index.html'),
          project02: resolve(__dirname, 'project02/index.html')
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
          // additionalData: `
          //   @use "sass:math";
          //   @import "./src/styles/theme.scss";
          // `
        }
      }
    },
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment'
    }
  }
})

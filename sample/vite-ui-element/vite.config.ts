import { resolve } from 'path'
import { defineConfig } from 'vite'
import createVuePlugin from '@vitejs/plugin-vue'

const vuePlugin = createVuePlugin({ include: [/\.vue$/] })

const projRoot = resolve(__dirname, '..', '..')

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
          main: resolve(__dirname, 'index.html')
        }
      }
    },
    server: {
      host: '127.0.0.1',
      port: 4090
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "sass:math";
            @import "${projRoot}/node_modules/@zpage/ui-element/src/styles/theme.scss";
          `
        }
      }
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'vuex', 'element-plus']
    },
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment'
    }
  }
})

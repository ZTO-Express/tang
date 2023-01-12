import { resolve } from 'path'
import { defineConfig } from 'vite'

import createVuePlugin from '@vitejs/plugin-vue'
import VueTypeImports from 'vite-plugin-vue-type-imports'

import { createHtmlPlugin } from 'vite-plugin-html'

import createMarkdownPlugin from 'vite-plugin-md'

import markdownItAnchor from 'markdown-it-anchor'
import { v4 as uuidv4 } from 'uuid'

import markdownItPrism from 'markdown-it-prism'
import { markdownItZPageDoc } from './scripts/doc'

import { dependencies as packageDependencies } from './site/package.json'
import { APP_NAME, APP_TITLE, APP_ZCAT_KEY, HOST_APP_PROD_HOSTS as APP_PROD_HOSTS } from './site/src/consts'

// 独立的包（一般比较大，这里需要特殊处理）
const independentVendors = ['xlsx', 'echarts']

const HtmlInjectData = {
  APP_NAME,
  APP_TITLE,
  APP_ZCAT_KEY,
  APP_PROD_HOSTS: JSON.stringify(APP_PROD_HOSTS)
}

export default defineConfig({
  root: __dirname,
  publicDir: resolve(__dirname, 'site', 'public'),
  plugins: [
    createVuePlugin({ include: [/\.vue$/, /\.md$/] }),
    VueTypeImports(),
    createMarkdownPlugin({
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true
      },
      markdownItSetup(md) {
        // 解析ZPage Code
        md.use(markdownItZPageDoc)
        // add anchor links to your H[x] tags
        md.use(markdownItAnchor, { slugify: s => uuidv4() })
        // add code syntax highlighting with Prism
        // md.use(markdownItPrism)
      }
    }),
    createHtmlPlugin({
      minify: false,
      pages: [{ template: 'site/index.html', filename: 'index.html', injectOptions: { data: HtmlInjectData } }]
    })
  ],
  resolve: {
    alias: [
      {
        find: '@zto/zpage-site-base',
        replacement: resolve(__dirname, './packages/site-base/src')
      },
      {
        find: '@zto/zpage-ui-element/src/styles',
        replacement: resolve(__dirname, './packages/ui-element/src/styles')
      },
      {
        find: '@zto/zpage-ui-element',
        replacement: resolve(__dirname, './packages/ui-element/src')
      },
      {
        find: '@zto/zpage-core',
        replacement: resolve(__dirname, './packages/core/src')
      },
      {
        find: '@zto/zpage-ffb',
        replacement: resolve(__dirname, './packages/ffb/src')
      },
      {
        find: '@zto/zpage-runtime',
        replacement: resolve(__dirname, './packages/runtime/src')
      },
      {
        find: '@zto/zpage',
        replacement: resolve(__dirname, './packages/zpage/src')
      },
      {
        find: '@',
        replacement: resolve(__dirname, './site/src')
      },
      {
        find: /~(.+)/,
        replacement: resolve(__dirname, 'node_modules/$1')
      }
    ]
  },
  build: {
    minify: false,
    outDir: './dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'site', 'index.html')
      },
      output: {
        manualChunks: { ...renderChunks() } // 分割打包
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 4010
  },
  optimizeDeps: {
    include: ['element-plus', '@element-plus/icons', 'echarts']
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
})

/** chunks配置 */
function renderChunks() {
  const vendor: string[] = []
  const chunks: Record<string, any> = {}
  Object.keys(packageDependencies).forEach(key => {
    if (independentVendors.includes(key)) chunks[key] = [key]
    else vendor.push(key)
  })
  chunks['vendor'] = vendor

  console.log('chunks:', chunks)
  return chunks
}

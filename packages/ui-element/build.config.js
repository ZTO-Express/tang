export const genTypes = false
export const genSchemas = false

export const rollup = {
  internal: ['@element-plus/icons', '@element-plus/tokens', 'element-plus'],
  plugins: {
    vue: {
      preprocessOptions: {
        scss: {
          additionalData: `
            @use "sass:math";
            @import "./src/styles/theme.scss";
          `
        }
      }
    }
  }
}

export const browser = {
  external: ['vue', '@zto/zpage', 'element-plus'],
  output: {
    name: 'ZPageElementUI',
    globals: {
      vue: 'Vue',
      '@zto/zpage': 'ZPage',
      'element-plus': 'ElementPlus'
    }
  }
}

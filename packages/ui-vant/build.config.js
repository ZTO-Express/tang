export const genTypes = false

export const rollup = {
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
  external: ['vue', '@zto/zpage-runtime', '@zto/zpage'],
  output: {
    name: 'ZPageVantUI',
    globals: {
      vue: 'Vue',
      '@zto/zpage-runtime': 'ZPageRuntime',
      '@zto/zpage': 'ZPage'
    }
  }
}

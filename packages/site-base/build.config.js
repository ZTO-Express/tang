// 生产类型
export const genTypes = false

export const tsconfig = {
  compilerOptions: {
    module: 'esnext',
    target: 'es2015'
  }
}

export const rollup = {}

export const browser = {
  external: ['vue', '@zto/zpage-runtime', '@zto/zpage', '@zto/zpage-ui-element', 'xlsx', 'echarts'],
  output: {
    name: 'ZPageSiteBase',
    globals: {
      vue: 'Vue',
      xlsx: 'XLSX',
      echarts: 'echarts',
      '@zto/zpage-runtime': 'ZPageRuntime',
      '@zto/zpage': 'ZPage',
      '@zto/zpage-ui-element': 'ZPageElementUI'
    }
  }
}

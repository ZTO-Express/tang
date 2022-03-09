// 生产类型
export const genTypes = true

export const tsconfig = {
  compilerOptions: {
    module: 'esnext',
    target: 'es2015'
  }
}

export const rollup = {
  internal: ['vue', 'vuex', 'vue-router'],
  plugins: {
    replace: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false)
    }
  }
}

export const browser = {
  // minify: true,
  external: ['axios', 'vue'],
  output: {
    name: 'ZPageRuntime',
    globals: {
      axios: 'axios',
      vue: 'Vue'
    }
  }
}

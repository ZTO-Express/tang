// 生产类型
export const genTypes = true

export const tsconfig = {
  compilerOptions: {
    module: 'esnext',
    target: 'es2015'
  }
}

export const rollup = {
  internal: ['vue', 'vuex', 'vue-router']
}

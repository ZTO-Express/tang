export const genTypes = true

export const tsconfig = {
  compilerOptions: {
    module: 'esnext',
    target: 'es2020'
  }
}

export const rollup = {
  internal: ['vue', 'vuex', 'vue-router']
}

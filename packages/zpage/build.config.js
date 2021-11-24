export const tsconfig = {
  compilerOptions: {
    target: 'es2017',
    sourceMap: true
  },
  include: ['../../typings/**/*.ts', '../runtime/src', '../ffb/src/'],
  exclude: ['node_modules', '**/__tests__', 'dist/**']
}

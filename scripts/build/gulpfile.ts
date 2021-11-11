import path from 'path'
import { series, parallel } from 'gulp'
import { run } from './utils/process'
import { withTaskName, runTask } from './utils/gulp'
import { buildOutput, zpageOutput, zpagePackage, projRoot } from './utils/paths'
import { buildConfig } from './build-info'
import type { TaskFunction } from 'gulp'
import type { Module } from './build-info'

export const copyFiles = () => {
  const copyTypings = async () => {
    const src = path.resolve(projRoot, 'typings', 'global.d.ts')
    await run(`cp ${src} ${zpageOutput}`)
  }

  return Promise.all([
    run(`cp ${zpagePackage} ${path.join(zpageOutput, 'package.json')}`),
    run(`cp README.md ${zpageOutput}`),
    copyTypings()
  ])
}

export const copyTypesDefinitions: TaskFunction = done => {
  const src = `${buildOutput}/types/`
  const copy = (module: Module) =>
    withTaskName(`copyTypes:${module}`, () =>
      run(`rsync -a ${src} ${buildConfig[module].output.path}/`)
    )

  return parallel(copy('esm'), copy('cjs'))(done)
}

export const copyFullStyle = async () => {
  await run(`mkdir -p ${zpageOutput}/dist`)
  await run(`cp ${zpageOutput}/theme-chalk/index.css ${zpageOutput}/dist/index.css`)
}

export default series(
  withTaskName('clean', () => run('pnpm run clean')),

  parallel(
    runTask('buildModules'),
    runTask('buildFullBundle'),
    runTask('generateTypesDefinitions'),
    runTask('buildHelper'),
    series(
      withTaskName('buildThemeChalk', () => run('pnpm run -C packages/theme-chalk build')),
      copyFullStyle
    )
  ),

  parallel(copyTypesDefinitions, copyFiles)
)

export * from './compilers/types-definitions'
export * from './compilers/modules'
export * from './compilers/full-bundle'

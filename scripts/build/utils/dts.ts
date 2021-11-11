import path from 'path'
import * as vueCompiler from '@vue/compiler-sfc'
import fse from 'fs-extra'
import glob from 'fast-glob'
import { bold } from 'chalk'
import { Project } from 'ts-morph'

import { green, red, yellow } from './log'
import { excludeFiles } from './pkg'
import { typingsRoot } from './paths'
import { readBuildConfig } from './config'

import type { SourceFile, ProjectOptions } from 'ts-morph'

/** 生产类型文件 */
export async function generateTypesDefinitions(pkgDir: string, options: Partial<ProjectOptions>) {
  let compilerOptions = {
    allowJs: true,
    declaration: true,
    emitDeclarationOnly: true,
    noEmitOnError: false,
    skipLibCheck: true,
    esModuleInterop: true,
    downlevelIteration: true,
    ...options.compilerOptions
  }

  let projectOptions = {
    skipAddingFilesFromTsConfig: true,
    ...options
  }

  const buildTsConfig = await readBuildConfig(pkgDir, 'tsconfig')

  if (buildTsConfig) {
    compilerOptions = Object.assign(compilerOptions, buildTsConfig.compilerOptions)
    projectOptions = Object.assign(projectOptions, buildTsConfig)
  }
  projectOptions.compilerOptions = compilerOptions

  const project = new Project(projectOptions)

  const filePaths = excludeFiles(
    await glob(['src/**/*.{js,ts,vue}'], {
      cwd: pkgDir,
      absolute: true,
      onlyFiles: true
    })
  )

  const typingPaths = await glob(['**/*.d.ts'], {
    cwd: typingsRoot,
    absolute: true,
    onlyFiles: true
  })

  const sourceFiles: SourceFile[] = []

  await Promise.all([
    ...filePaths.map(async file => {
      if (file.endsWith('.vue')) {
        const content = await fse.readFile(file, 'utf-8')
        const sfc = vueCompiler.parse(content)
        const { script, scriptSetup } = sfc.descriptor
        if (script || scriptSetup) {
          let content = ''
          let isTS = false
          if (script && script.content) {
            content += script.content
            if (script.lang === 'ts') isTS = true
          }
          if (scriptSetup) {
            const compiled = vueCompiler.compileScript(sfc.descriptor, {
              id: 'xxx'
            })
            content += compiled.content
            if (scriptSetup.lang === 'ts') isTS = true
          }
          const sourceFile = project.createSourceFile(
            path.relative(process.cwd(), file) + (isTS ? '.ts' : '.js'),
            content
          )
          sourceFiles.push(sourceFile)
        }
      } else {
        const sourceFile = project.addSourceFileAtPath(file)
        sourceFiles.push(sourceFile)
      }
    }),
    ...typingPaths.map(async file => {
      const sourceFile = project.addSourceFileAtPath(file)
      sourceFiles.push(sourceFile)
    })
  ])

  const diagnostics = project.getPreEmitDiagnostics()
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics))

  await project.emit({
    emitOnlyDtsFiles: true
  })

  const tasks = sourceFiles.map(async sourceFile => {
    const relativePath = path.relative(pkgDir, sourceFile.getFilePath())
    yellow(`Generating definition for file: ${bold(relativePath)}`)

    const emitOutput = sourceFile.getEmitOutput()
    const emitFiles = emitOutput.getOutputFiles()
    if (emitFiles.length === 0) {
      red(`Emit no file: ${bold(relativePath)}`)
      return
    }

    const _tasks = emitFiles.map(async outputFile => {
      const filepath = outputFile.getFilePath()
      await fse.mkdir(path.dirname(filepath), {
        recursive: true
      })

      await fse.writeFile(filepath, outputFile.getText(), 'utf8')

      green(`Definition for file: ${bold(relativePath)} generated`)
    })

    await Promise.all(_tasks)
  })

  await Promise.all(tasks)
}

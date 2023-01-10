import { ProjectOptions } from 'ts-morph'

import { readBuildConfig } from '../config'

import { SchemaParser } from './parsers/SchemaParser'

/** 生产Schema文件 */
export async function generateSchemas(pkgDir: string, options?: Partial<ProjectOptions>) {
  const tsBuildConfig = await readBuildConfig(pkgDir, 'tsconfig')

  const projectOptions = {
    ...tsBuildConfig,
    ...options,
    compilerOptions: { ...tsBuildConfig?.compilerOptions, ...options?.compilerOptions }
  }

  const schemaParser = new SchemaParser({ rootDir: pkgDir, projectOptions })

  const wSchemas = schemaParser.parseWidgetSourceFileAtPath('src/widgets/crud/WCrud.ts')

  // const project = new Project(projectOptions)
  // const sourceFile = project.addSourceFileAtPath(resolve(pkgDir, 'src/widgets/crud/WCrud.ts'))
  // const result = parseWidgetInterfaces(sourceFile)
}

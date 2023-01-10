import path from 'path'
import * as vueCompiler from '@vue/compiler-sfc'
import fse from 'fs-extra'

/**
 * 编译单文件组件
 */
export async function compilerSfc(filePath: string) {
  const fileText = await fse.readFile(filePath, 'utf-8')

  const sfc = vueCompiler.parse(fileText)
  const { script, scriptSetup } = sfc.descriptor

  if (!script && !scriptSetup) return undefined

  let content = ''
  let isTS = false

  if (script && script.content) {
    content += script.content
    if (script.lang === 'ts') isTS = true
  }

  if (scriptSetup) {
    const compiled = vueCompiler.compileScript(sfc.descriptor, { id: 'xxx' })
    content += compiled.content
    if (scriptSetup.lang === 'ts') isTS = true
  }

  return { isTS, filePath, content }
}

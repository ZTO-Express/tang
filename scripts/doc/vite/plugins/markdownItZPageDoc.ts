import MarkdownIt from 'markdown-it'
import $ from 'gogocode'

import type { RenderRule } from 'markdown-it/lib/renderer'

export const DocSampleTag = 'doc-sample'
export const DocSchemaTag = 'doc-schema'

/** 解析文档 */
export default function doc(md: MarkdownIt, options: any) {
  md.renderer.rules.fence = applyCodeTransform(md, options, md.renderer.rules.fence || (() => ''))
}

/** code转换 */
function applyCodeTransform(md: MarkdownIt, options: any, existingRule: RenderRule): RenderRule {
  return (tokens, idx, renderOptions, env, self) => {
    const fenceToken = tokens[idx]

    const info = fenceToken.info ? md.utils.unescapeAll(fenceToken.info).trim() : ''
    const lang = info.split(/(\s+)/g)[0]

    if (!lang) {
      return existingRule(tokens, idx, renderOptions, env, self)
    } else {
      const trimContent = fenceToken.content.trim()

      let scriptCode = trimContent

      for (const tag of [DocSampleTag, DocSchemaTag]) {
        const docTagPrefix = `--- ${tag}:`
        const commitDocTagPrefix = `// --- ${tag}:`

        let tagPrefix = ''

        if (trimContent.startsWith(docTagPrefix)) {
          tagPrefix = docTagPrefix
        } else if (trimContent.startsWith(commitDocTagPrefix)) {
          tagPrefix = commitDocTagPrefix
        }

        // 未命中直接返回
        if (!tagPrefix) continue

        const firstLine = trimContent.substring(0, trimContent.indexOf('\n'))

        scriptCode = trimContent.substring(firstLine.length).trim()

        const docMetaStr = firstLine.substring(tagPrefix.length, trimContent.lastIndexOf('---')).trim()

        // let prismCode = existingRule(tokens, idx, renderOptions, env, self)
        // prismCode = prismCode.replace(new RegExp(`--- ${DocSampleTag}(.*?)---(.*?)\n`), '')

        const encodedScriptCode = encodeURIComponent(scriptCode)

        return `<c-${tag} code='${encodedScriptCode}' lang='${lang}' meta='${docMetaStr}' />`
      }

      const existingResult = existingRule(tokens, idx, renderOptions, env, self)

      const result = existingResult
      return result
    }
  }
}

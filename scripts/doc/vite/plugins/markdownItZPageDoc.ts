import MarkdownIt from 'markdown-it'
import $ from 'gogocode'

import type { RenderRule } from 'markdown-it/lib/renderer'

export const DocSampleTag = 'doc-sample'

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

      const docSamplePrefix = `--- ${DocSampleTag}:`

      if (trimContent.startsWith(docSamplePrefix)) {
        // 用于代码转换

        // const $code = $(trimContent)
        // $code.replace()

        const firstLine = trimContent.substring(0, trimContent.indexOf('\n'))

        scriptCode = trimContent.substring(trimContent.indexOf('\n')).trim()

        const docMetaStr = firstLine.substring(docSamplePrefix.length, trimContent.lastIndexOf('---')).trim()

        let prismCode = existingRule(tokens, idx, renderOptions, env, self)

        // 清除前缀
        prismCode = prismCode.replace(new RegExp(`--- ${DocSampleTag}(.*?)---(.*?)\n`), '')

        return `<c-doc-code code='${scriptCode}' prismCode='${prismCode}' lang='${lang}' meta='${docMetaStr}' />`
      }

      const existingResult = existingRule(tokens, idx, renderOptions, env, self)

      const result = existingResult
      return result
    }
  }
}

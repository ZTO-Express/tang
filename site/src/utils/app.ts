import type { AppPageDefinition } from '@zto/zpage'
import type { GlobMap } from '@zto/zpage-site-base'

const indexPostfix = '/index.ts'
const mdIndexPostfix = '/index.md'

/** 规范化文档页面 */
export function normalizeDocPagesMap(docPagesMap: GlobMap<any>): GlobMap<AppPageDefinition> {
  const pagesMap = Object.keys(docPagesMap).reduce((map: Record<string, any>, key: string) => {
    let p: any = docPagesMap[key]
    let k = key

    // 转换markdown页面
    if (key.endsWith(mdIndexPostfix)) {
      k = key.substring(0, key.length - mdIndexPostfix.length) + indexPostfix
      p = { default: { type: 'doc-page', markdown: { cmpt: p.default, frontmatter: p.frontmatter } } }
    }

    map[k] = p

    return map
  }, {} as Record<string, any>)

  return pagesMap
}

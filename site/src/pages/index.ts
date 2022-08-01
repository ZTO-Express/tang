import { getPagesFromGlobMap } from '@zto/zpage-site-base'
import { normalizeDocPagesMap } from '../utils'

import type { GlobMap } from '@zto/zpage-site-base'

// 导入 pages 目录下面的
const docPagesMap: GlobMap<any> = import.meta.globEager(`../pages/**/index(.ts|.md)`)

// 规范化导出页面
const pagesMap = normalizeDocPagesMap(docPagesMap)

const pages = getPagesFromGlobMap(pagesMap)

export { pages }

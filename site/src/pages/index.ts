import { getPagesFromGlobMap } from '@zto/zpage-site-base'

import type { AppPageDefinition } from '@zto/zpage'
import type { GlobMap } from '@zto/zpage-site-base'

// 导入 pages 目录下面的
const pagesMap: GlobMap<AppPageDefinition> = import.meta.globEager(`../pages/**/index.ts`)

// 预处理导出页面
const pages = getPagesFromGlobMap(pagesMap)

export { pages }

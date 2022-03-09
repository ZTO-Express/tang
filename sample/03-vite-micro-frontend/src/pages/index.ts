import type { PageSchema } from '@zto/zpage'

const basePath = '../pages'
const indexPostfix = '/index.ts'
const indexFile = `${basePath}${indexPostfix}`

// 导入 pages 目录下面的
const pageItems: Record<string, PageSchema> = import.meta.globEager(`../pages/**/index.ts`)

// 预处理导出页面
const pages = Object.keys(pageItems)
  .map(key => {
    // index文件不导出
    if (key === indexFile) return undefined

    const pageItem = pageItems[key]
    const page = pageItem.default || pageItem.page

    if (!page.path) {
      page.path = getPagePathByPageKey(key)
    }

    if (!page) return undefined

    return page
  })
  .filter(page => !!page)

export { pages }

function getPagePathByPageKey(key: string) {
  if (!key) return key

  let path = key.substring(basePath.length)

  if (path.endsWith(indexPostfix)) {
    path = path.substring(0, path.length - indexPostfix.length)
  } else if (path.endsWith('.ts')) {
    path = path.substring(0, path.length - '.ts'.length)
  }

  return path
}

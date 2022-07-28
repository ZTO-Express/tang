/** 格式化表单项 */
export function normalizeInfoItems(items: any[]) {
  items.forEach(it => {
    it.type = it.type || 'text'

    if (it.type === 'image' || it.type === 'video') {
      it.span = 4
      it.title = it.label
      it.label = null
      it.autoHeight = true
    }
  })

  return items
}

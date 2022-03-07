import { Widget } from 'zpage/core'

// 导入 widgets 目录下面的
const widgetsMap: Record<string, any> = import.meta.globEager(`../widgets/**/W*.vue`)

const widgets: Widget[] = []

for (const key in widgetsMap) {
  const widget = widgetsMap[key].default

  if (!widget.name) widget.name = key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.'))
  widgets.push(widget)
}

export { widgets }

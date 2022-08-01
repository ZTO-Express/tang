import { getComponentsFromGlobMap } from '@zto/zpage-site-base'

import type { Widget } from '@zto/zpage'

// 导入 widgets 目录下面的
const widgetsMap: Record<string, Widget> = import.meta.globEager(`../widgets/**/W*.vue`)

const widgets = getComponentsFromGlobMap<Widget>(widgetsMap)

export { widgets }

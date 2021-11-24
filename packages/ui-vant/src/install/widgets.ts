import * as widgetsMap from '../widgets'

import type { VueComponent, Installable, InstallableOptions } from '@zto/zpage'

export default (instance: Installable, options?: InstallableOptions): void => {
  const innerWidgets: VueComponent[] = []

  for (const key in widgetsMap) {
    const widget = (widgetsMap as any)[key]

    if (!widget.name) widget.name = key
    innerWidgets.push(widget)
  }

  instance.register([...innerWidgets])
}

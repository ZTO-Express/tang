import * as widgetsMap from '../widgets'

import type { VueComponent, AppOptions, Runtime } from '@zpage/zpage'

export default (instance: Runtime, options?: AppOptions): void => {
  const innerWidgets: VueComponent[] = []

  for (const key in widgetsMap) {
    const widget = (widgetsMap as any)[key]

    if (!widget.name) widget.name = key
    innerWidgets.push(widget)
  }

  instance.register([...innerWidgets])
}

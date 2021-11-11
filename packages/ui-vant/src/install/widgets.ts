import * as widgetsMap from '../widgets'

import type { Component } from 'vue'
import type { AppOptions, Runtime } from '@zto/zpage'

export default (instance: Runtime, options?: AppOptions): void => {
  const innerWidgets: Component[] = []

  for (const key in widgetsMap) {
    const widget = (widgetsMap as any)[key]

    if (!widget.name) widget.name = key
    innerWidgets.push(widget)
  }

  instance.register([...innerWidgets])
}

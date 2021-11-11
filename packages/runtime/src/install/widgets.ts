import { warn } from '../utils'

import * as widgetsMap from '../widgets'

import type { Component } from 'vue'
import type { AppOptions } from '../typings'
import type { Runtime } from '../runtime'

export default async (instance: Runtime, options?: AppOptions) => {
  const { app } = instance

  if (!app) {
    warn('请先实例化再注册微件')
    return
  }

  const innerWidgets: Component[] = []

  for (const key in widgetsMap) {
    const widget = (widgetsMap as any)[key]

    if (!widget.name) widget.name = key
    innerWidgets.push(widget)
  }

  // 注册widgets(优先注册外部组件，支持重载)
  const exWidgets = options?.extends?.widgets || []
  instance.register([...exWidgets, ...innerWidgets])
}

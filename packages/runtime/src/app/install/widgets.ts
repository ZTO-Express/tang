import { warn } from '../../utils'

import * as widgetsMap from '../widgets'

import type { Component } from 'vue'
import type { Installable, InstallableOptions } from '../../typings'

export default async (target: Installable, options: InstallableOptions) => {
  const { vueApp } = target
  if (!vueApp) {
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
  const exWidgets = options.extensions?.widgets || []
  target.register([...exWidgets, ...innerWidgets])
}

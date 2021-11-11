import { warn } from '../utils'

import * as componentsMap from '../components'
import * as directivesMap from '../directives'

import type { Runtime } from '../runtime'
import type { Component } from 'vue'
import type { AppOptions } from '../typings'

export default async (instance: Runtime, options?: AppOptions) => {
  const { app } = instance

  if (!app) {
    warn('请先实例化再注册组件')
    return
  }

  // 安装全局指令
  for (const key in directivesMap) {
    const item = (directivesMap as any)[key]
    if (item?.install) item.install(app)
  }

  // 安装全局组件
  for (const key in componentsMap) {
    const cmpt = (componentsMap as any)[key]
    const cmptName = cmpt.name || key
    app.component(cmptName, cmpt)
  }

  // 安装外部组件
  const exComponents = options?.extends?.components || []
  exComponents.forEach((cmpt: Component) => {
    if (cmpt.name && cmpt.name.startsWith('C')) {
      app.component(cmpt.name as string, cmpt)
    }
  })
}

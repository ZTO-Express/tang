import { warn } from '@zpage/zpage'

import * as componentsMap from './vant_components'

import type { AppOptions, Runtime } from '@zpage/zpage'
import type { App } from 'vue'

export default (instance: Runtime, options?: AppOptions): void => {
  const { app } = instance

  if (!app) {
    warn('请先实例化再注册组件')
    return
  }

  app.use(componentsMap.Toast)

  Object.keys(componentsMap).forEach(key => {
    install(app, componentsMap[key], key)
  })
}

function install(app: App<Element>, cmpt: any, name?: string) {
  app.use(cmpt)

  if (name) {
    app.component(name, cmpt)
  }
}

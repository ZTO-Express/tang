import { warn } from 'zpage'
import * as componentsMap from '../components'

import type { AppOptions, Runtime } from 'zpage'

export default (instance: Runtime, options?: AppOptions): void => {
  const { app } = instance

  if (!app) {
    warn('请先实例化再注册组件')
    return
  }

  // 安装全局组件
  for (const key in componentsMap) {
    const cmpt = (componentsMap as any)[key]
    const cmptName = cmpt.name || key

    app.component(cmptName, cmpt)
  }
}

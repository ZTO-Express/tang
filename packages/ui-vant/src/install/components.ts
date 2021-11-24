import { warn } from '@zto/zpage'
import * as componentsMap from '../components'

import type { InstallableOptions, Installable } from '@zto/zpage'

export default (instance: Installable, options?: InstallableOptions): void => {
  const { vueApp } = instance

  if (!vueApp) {
    warn('请先实例化再注册组件')
    return
  }

  // 安装全局组件
  for (const key in componentsMap) {
    const cmpt = (componentsMap as any)[key]
    const cmptName = cmpt.name || key

    vueApp.component(cmptName, cmpt)
  }
}

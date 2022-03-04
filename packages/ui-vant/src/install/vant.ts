import { warn } from '@zto/zpage'

import * as componentsMap from './vant_components'

import type { VueApp, VueComponent, Installable, InstallableOptions } from '@zto/zpage'

export default (target: Installable, options?: InstallableOptions): void => {
  const { vueApp } = target

  if (!vueApp) {
    warn('请先实例化再注册组件')
    return
  }

  Object.keys(componentsMap).forEach((key) => {
    install(vueApp, (componentsMap as any)[key] as VueComponent, key)
  })
}

function install(vueApp: VueApp, cmpt: any, name?: string) {
  vueApp.use(cmpt)
  if (name) vueApp.component(name, cmpt)
}

import { warn } from '../../utils'

import * as entryMap from '../../entry'
import * as directivesMap from '../directives'
import * as componentsMap from '../components'

import type { Component } from 'vue'
import type { Installable, InstallableOptions } from '../../typings'

export default async (target: Installable, options: InstallableOptions) => {
  const { vueApp } = target
  if (!vueApp) {
    warn('请先实例化再注册组件')
    return
  }

  // 安装全局指令
  for (const key in directivesMap) {
    const item = (directivesMap as any)[key]
    if (item?.install) item.install(vueApp)
  }

  // 安装入口组件
  for (const key in entryMap) {
    const cmpt = (entryMap as any)[key]
    const cmptName = cmpt.name || key
    vueApp.component(cmptName, cmpt)
  }

  // 安装内部组件
  for (const key in componentsMap) {
    const cmpt = (componentsMap as any)[key]
    const cmptName = cmpt.name || key
    vueApp.component(cmptName, cmpt)
  }

  // 安装外部组件
  const exComponents = options.extensions?.components || []
  exComponents.forEach((cmpt: Component) => {
    if (cmpt.name && cmpt.name.startsWith('C')) {
      vueApp.component(cmpt.name as string, cmpt)
    }
  })
}

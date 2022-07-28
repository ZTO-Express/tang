import installRouter from '../router/install'
import installComponents from './components'
import installWidgets from './widgets'
import installPlugins from './plugins'

import type { InstallableOptions } from '../../typings'
import type { App } from '../App'

/** 安装插件 */
export async function installUI(app: App, options: InstallableOptions) {
  // 安装全局组件，并配置相关变量
  await installComponents(app, options)

  // 安装全局微件
  await installWidgets(app, options)
}

export { installRouter, installPlugins }

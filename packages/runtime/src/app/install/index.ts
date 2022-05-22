import installRouter from '../router/install'
import installComponents from './components'
import installWidgets from './widgets'
import installPlugins from './plugins'

import type { InstallableOptions } from '../../typings'
import type { App } from '../App'

/** 安装插件 */
export async function install(app: App, options: InstallableOptions) {
  // 安装全局组件，并配置相关变量
  await installComponents(app, options)

  // 安装全局微件
  await installWidgets(app, options)

  // 安装路由
  await installRouter(app, options)

  // 安装插件
  await installPlugins(app, options)
}

import installComponents from './components'
import installWidgets from './widgets'
import installRouter from './router'
import installPlugins from './plugins'

import type { AppOptions } from '../typings'
import type { Runtime } from '../runtime'

/** 安装插件 */
export async function install(instance: Runtime, options?: AppOptions) {
  // 安装全局组件，并配置相关变量
  await installComponents(instance, options)

  // 安装全局微件
  await installWidgets(instance, options)

  // 安装路由
  await installRouter(instance, options)

  // 安装插件
  await installPlugins(instance, options)
}

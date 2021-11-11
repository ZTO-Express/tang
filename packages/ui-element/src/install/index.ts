import installElement from './element'
import installComponents from './components'
import installWidgets from './widgets'

import type { Runtime, AppOptions } from '@zto/zpage'

/** 安装插件 */
export async function install(instance: Runtime, options?: AppOptions) {
  // 安装Element
  await installElement(instance, options)

  // 安装全局组件，并配置相关变量
  await installComponents(instance, options)

  // 安装全局微件
  await installWidgets(instance, options)
}

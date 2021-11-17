import installElement from './element'
import installComponents from './components'
import installWidgets from './widgets'

import type { Installable, InstallableOptions } from '@zpage/zpage'

/** 安装插件 */
export async function install(target: Installable, options?: InstallableOptions) {
  // 安装Element
  await installElement(target, options)
  // 安装全局组件，并配置相关变量
  await installComponents(target, options)
  // 安装全局微件
  await installWidgets(target, options)
}

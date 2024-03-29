import installVant from './vant'
import installComponents from './components'
import installWidgets from './widgets'
import type { Installable, InstallableOptions } from '@zto/zpage'

/** 安装插件 */
export async function install(instance: Installable, options?: InstallableOptions) {
  // 安装Vant
  await installVant(instance, options)

  // 安装全局组件，并配置相关变量
  await installComponents(instance, options)

  // 安装全局微件
  await installWidgets(instance, options)
}

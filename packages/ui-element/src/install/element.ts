import { warn } from '@zto/zpage'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import type { Installable, InstallableOptions } from '@zto/zpage'

export default (instance: Installable, options?: InstallableOptions): void => {
  const { vueApp } = instance

  if (!vueApp) {
    warn('请先实例化再注册组件')
    return
  }

  vueApp.use(ElementPlus, { locale: zhCn, size: 'mini', zIndex: 3000 })
}

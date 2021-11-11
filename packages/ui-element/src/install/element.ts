import { warn } from '@zto/zpage'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import type { Runtime, AppOptions } from '@zto/zpage'

export default (instance: Runtime, options?: AppOptions): void => {
  const { app } = instance

  if (!app) {
    warn('请先实例化再注册组件')
    return
  }

  app.use(ElementPlus, { locale: zhCn, size: 'mini', zIndex: 3000 })
}

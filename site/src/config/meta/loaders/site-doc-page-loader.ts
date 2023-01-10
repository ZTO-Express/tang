import { AppLoaderType } from '@zto/zpage'

import type { App, AppPageLoader } from '@zto/zpage'

export const SiteDocPageLoader: AppPageLoader = {
  type: AppLoaderType.PAGE,

  name: 'site-doc',

  // 解析菜单数据
  async loadPage(app: App, path: string) {
    // 优先尝试从本地获取路径
    const page: any = app.usePage(path)

    return page
  }
}

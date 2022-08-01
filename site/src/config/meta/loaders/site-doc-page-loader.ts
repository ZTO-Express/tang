import { AppLoaderType } from '@zto/zpage'

import type { App, AppPageLoader } from '@zto/zpage'

export const SiteDocPageLoader: AppPageLoader = {
  type: AppLoaderType.PAGE,

  name: 'site-doc',

  // 解析菜单数据
  async loadPage(app: App, path: string) {
    // 优先尝试从本地获取路径
    let page = app.usePage(path)
    // data开头的路有需要从远程获取路径
    // if (!page && path.startsWith(APP_PAGE_PATH_PREFIX)) {
    //   const schemaUrl = pageUtil.getDataPageSchemaUrl(path)
    //   page = await dataApi.get('basic/page/get', { pagePath: schemaUrl })
    //   if (page) {
    //     page.path = path
    //     app.setPage(path, page)
    //     // app.pages.push(page)
    //   }
    // }

    return page
  }
}

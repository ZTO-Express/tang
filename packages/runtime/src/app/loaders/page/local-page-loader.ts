import { AppLoaderType } from '../../../consts'

import type { AppPageLoader } from '../../../typings'
import type { App } from '../../App'

export const LocalPageLoader: AppPageLoader = {
  type: AppLoaderType.PAGE,

  name: 'local',

  // 解析菜单数据
  async loadPage(app: App, path: string) {
    const page = app.usePage(path)
    return page
  }
}

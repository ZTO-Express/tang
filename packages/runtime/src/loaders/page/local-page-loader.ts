import { usePage } from '../../config'
import type { AppPageLoader } from '../../typings'

export const LocalPageLoader: AppPageLoader = {
  name: 'local',

  // 解析菜单数据
  async loadPage(path: string) {
    const page = usePage(path)
    return page
  }
}

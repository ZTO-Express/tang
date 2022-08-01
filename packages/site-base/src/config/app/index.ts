import { defineAppConfig } from '@zto/zpage'

import { HOST_APP_TITLE } from '../../consts'

import type { App, AppAppConfig } from '@zto/zpage'

export default defineAppConfig<AppAppConfig>((app: App) => {
  return {
    title: HOST_APP_TITLE,
    menu: { showNav: true, maxNavs: 15 },
    auth: {
      loader: 'iam',
      token: {
        // autoRefresh: false // 自动刷新token
        // refreshDuration: 600 // accessToken刷新频率（默认60分钟）
      }
    }
    // page: { loader: 'local' }
  }
})

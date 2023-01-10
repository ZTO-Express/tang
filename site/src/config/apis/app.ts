// 当前应用共配请求相关Api

import { defineAppApi, App } from '@zto/zpage'

export default defineAppApi((app: App) => {
  return {
    baseUrl: app.env.apiUrl,

    methods: api => {
      return {}
    }
  }
})

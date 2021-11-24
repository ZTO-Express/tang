import { warn } from '../../utils'
import { createAppRoutes } from './util'

import type { Router } from 'vue-router'
import type { InstallableOptions } from '../../typings'
import type { App } from '../App'

export default async (app: App, options: InstallableOptions): Promise<Router | undefined> => {
  if (!app.vueApp) {
    warn('请先实例化再安装路由')
    return
  }

  const { router, store } = app

  // 根据当前子模块创建相关路由
  const submodules = store.state.app.submodules
  createAppRoutes(router, submodules)

  // 设置所有默认页
  const routes = router.getRoutes()
  const defaultPages = routes.filter((it) => it.meta?.default === true).map((it) => it.meta)
  await store.dispatch('pages/setDefaults', defaultPages, { root: true })

  app.vueApp.use(router)

  return router
}

import { warn } from '../utils'
import { createAppRoutes } from '../router/util'

import type { Router } from 'vue-router'
import type { AppOptions } from '../typings'
import type { Runtime } from '../runtime'

export default async (instance: Runtime, options?: AppOptions): Promise<Router | undefined> => {
  if (!instance.app) {
    warn('请先实例化再安装路由')
    return
  }

  const { router, store } = instance

  // 根据当前子模块创建相关路由
  const submodules = store.state.app.submodules
  createAppRoutes(router, submodules)

  // 设置所有默认页
  const routes = router.getRoutes()
  const defaultPages = routes.filter(it => it.meta?.default === true).map(it => it.meta)
  await store.dispatch('pages/setDefaults', defaultPages, { root: true })

  instance.app.use(router)

  return router
}

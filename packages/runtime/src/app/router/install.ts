import { warn } from '../../utils'
import { createAppRoutes } from './util'

import type { Router } from 'vue-router'
import type { InstallableOptions, PageInfo } from '../../typings'
import type { App } from '../App'

export default async (app: App, options: InstallableOptions): Promise<Router | undefined> => {
  if (!app.vueApp) {
    warn('请先实例化再安装路由')
    return
  }

  const baseRoute = app.useConfig('router.base', '')
  const menus = app.useConfig('menus', [])

  const { pagesStore, appStore } = app.stores
  const router = app.router

  // 根据当前子模块创建相关路由
  const submodules = appStore.allSubmodules

  createAppRoutes(router, submodules, { baseRoute, menus })

  // 设置所有默认页
  const routes = router.getRoutes()
  const defaultPages = routes.filter(it => it.meta?.default === true).map(it => it.meta)
  await pagesStore.setDefaults(defaultPages as any as PageInfo[])

  return router
}

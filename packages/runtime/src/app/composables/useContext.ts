import { App } from '../App'

import type { AppStore } from '../../typings/store'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

/** 默认应用上下文 */
export interface AppContext {
  data: any
  app?: any
  user?: any
  page?: any
  route?: RouteLocationNormalizedLoaded
  store?: AppStore
}

/**
 * 获取应用上下文信息
 * @param data
 */
export function useAppContext(data: any = {}) {
  const instance = App.instance

  const context: AppContext = { data }

  if (instance) {
    const store = instance.store

    context.store = store
    context.app = store.getters.app
    context.user = store.getters.user
    context.page = store.getters.page

    context.route = instance.router.currentRoute.value
  }

  return context
}

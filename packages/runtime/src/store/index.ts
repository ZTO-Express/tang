import { createStore } from 'vuex'
import app from './modules/app'
import user from './modules/user'
import pages from './modules/pages'

import { getters } from './getters'

import type { AppStore } from '../typings'

let store: AppStore | undefined = undefined

export function createAppStore(): AppStore {
  if (store) return store

  store = createStore({
    getters,
    modules: { app, user, pages }
  })

  return store
}

// 获取当前store
export function useAppStore() {
  return createAppStore()
}

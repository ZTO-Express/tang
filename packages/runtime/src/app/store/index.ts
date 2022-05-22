import { FlushAppContextType } from '../../consts'

import { defineAppStore } from './modules/app'
import { defineUserStore } from './modules/user'
import { definePagesStore } from './modules/pages'

import type { App } from '../App'
import type { AppStores } from '../../typings'

/** 定义根store */
export function defineAppStores(app: App) {
  const useAppStore = defineAppStore(app)
  const useUserStore = defineUserStore(app)
  const usePagesStore = definePagesStore(app)

  return {
    useAppStore,
    useUserStore,
    usePagesStore
  }
}

/** 定义并应用appStores */
export function defineAndUseAppStores(app: App): AppStores {
  const { useAppStore, useUserStore, usePagesStore } = defineAppStores(app)

  const appStore = useAppStore(app.pinia)
  appStore.$subscribe(
    () => {
      app.flushContext(FlushAppContextType.APP)
    },
    { detached: true }
  )

  const userStore = useUserStore(app.pinia)
  userStore.$subscribe(
    () => {
      app.flushContext(FlushAppContextType.USER)
    },
    { detached: true }
  )

  const pagesStore = usePagesStore(app.pinia)
  pagesStore.$subscribe(
    () => {
      app.flushContext(FlushAppContextType.PAGE)
    },
    { detached: true }
  )

  return { appStore, userStore, pagesStore }
}

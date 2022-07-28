import { getCurrentInstance, ComponentInternalInstance, App as VueApp } from 'vue'
import { App } from '../App'
import { HostApp } from '../HostApp'

/** 获取当前应用实例 */
export function useCurrentAppInstance(getSingleApp = false): App {
  let ins = tryUseCurrentAppInstance(getSingleApp)

  if (!ins) throw new Error('[useCurrentAppInstance] 没有找到当前应用实例')

  return ins
}

/**
 * 获取当前应用实例，如果没有不抛出错误
 * @param getSingleApp
 */
export function tryUseCurrentAppInstance(
  getSingleApp = false,
  vueInstance?: VueApp | ComponentInternalInstance | null
): App | undefined {
  if (!vueInstance) vueInstance = getCurrentInstance()

  let appInstance: App | undefined = undefined

  if (vueInstance) {
    const appContext = (vueInstance as ComponentInternalInstance).appContext || (vueInstance as VueApp)._context
    appInstance = appContext?.config.globalProperties.$app
  }

  if (!appInstance && getSingleApp === true) appInstance = HostApp?.app

  return appInstance
}

/**
 * 获取应用上下文信息
 * @param data
 */
export function useAppContext(data: any = {}) {
  const app = useCurrentAppInstance()

  const _context = app.useContext(data)
  return _context
}

/** 应用ApiRequest */
export function useApiRequest() {
  const app = useCurrentAppInstance()
  return app.api.request
}

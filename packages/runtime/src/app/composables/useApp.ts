import { getCurrentInstance } from 'vue'
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
export function tryUseCurrentAppInstance(getSingleApp = false): App | undefined {
  const cmptInstance = getCurrentInstance()

  let ins = cmptInstance?.appContext?.config.globalProperties.$app

  if (!ins && getSingleApp === true) {
    ins = HostApp?.app
  }

  return ins
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

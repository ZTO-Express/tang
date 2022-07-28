import { HttpRequest, _ } from '../../utils'

import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { AppApi, AppApiConfig, MicroAppActiveRule } from '../../typings'
import type { App } from '../App'

/** 检查指定route是否符合激活规则 */
export function checkActiveRule(activeRule: MicroAppActiveRule, app: App, route?: RouteLocationNormalizedLoaded) {
  if (!activeRule) return false

  if (!route) route = app.router.currentRoute.value

  const routePath = route?.path // 当前路径
  if (!routePath) return false

  if (_.isString(activeRule)) {
    const _activeRule = activeRule.startsWith('^') ? activeRule : `^${activeRule}`
    const _activeRuleReg = new RegExp(_activeRule)

    return _activeRuleReg.test(routePath)
  } else if (_.isFunction(activeRule)) {
    return activeRule(route, app)
  }

  return false
}

/** 初始化应用 */
export function initalizeApis(apiCfgs: Record<string, AppApiConfig>, baseCfg: AppApiConfig) {
  if (!apiCfgs) return {}

  /** 初始化Api */
  const initApi = (apiCfg: AppApiConfig) => {
    const api = createApi(apiCfg, baseCfg)
    return api
  }

  const apis = Object.keys(apiCfgs).reduce((rtn, key) => {
    rtn[`${key}Api`] = initApi(apiCfgs[key])
    return rtn
  }, {} as Record<string, AppApi>)

  return apis
}

/** 初始化Api */
export function createApi(apiCfg: AppApiConfig, baseCfg: AppApiConfig) {
  const baseUrl = apiCfg.baseUrl || baseCfg.baseUrl

  const cfg = _.deepMerge(baseCfg, apiCfg)

  const api = new HttpRequest(baseUrl, cfg) as any
  api.request = cfg.request

  // 合并应用方法
  let baseMethods = _.isFunction(baseCfg.methods) ? baseCfg.methods!(api) : baseCfg.methods || {}
  let apiMethods = _.isFunction(cfg.methods) ? cfg.methods!(api) : cfg.methods || {}

  const allMethods = { ...apiMethods, ...baseMethods }

  Object.keys(allMethods).forEach(name => {
    api[name] = allMethods[name]
  })

  return api as AppApi
}

/** 规范化Widget名称 */
export function normalizeWidgetName(name: string) {
  let wName = name
  if (name && !name.startsWith('w-')) wName = `w-${name}`
  return wName
}

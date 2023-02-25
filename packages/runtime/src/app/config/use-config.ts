import { _ } from '../../utils'
import { AppConfigType } from '../../consts'

import type { PartialPageSchema, PageSchema } from '@zto/zpage-core'
import type { AppConfig, AppConfigDefinition, AppConfigMethod, AppPageDefinition } from '../../typings'
import type { App } from '../App'

/** 获取应用配置 */
export function useAppConfigs(app: App, cfgs: AppConfigDefinition[]): AppConfig {
  const appCfgs = cfgs.map(cfg => _useAppConfig(app, cfg)).filter(cfg => !!cfg)

  const mergedCfgs = _.deepMerge2(appCfgs)

  return mergedCfgs
}

/** 应用页面配置 */
export function useAppPages(app: App, pages?: AppPageDefinition[]): PageSchema[] {
  const _schemas = (pages || []).map(it => {
    const s = _useAppPage(app, it)
    return s
  })

  return _schemas
}

/** 检查当前配置是否应用方法 */
export function isAppUseMethod(cfg: any) {
  return _.isFunction(cfg) && cfg.__app_cfg_type
}

/** 应用页面配置 */
export function _useAppPage(app: App, page: AppPageDefinition) {
  let s: PartialPageSchema
  if (_.isFunction(page)) {
    s = (page as AppConfigMethod<PartialPageSchema>)(app)
    if (s && !s.path && (page as any).path) s.path = (page as any).path
  } else {
    s = page as PartialPageSchema
  }

  if (s && !s.type) s.type = 'page' // 默认页面Schema

  s = _useAppConfig(app, s, AppConfigType.PAGE)

  return s as PageSchema
}

/** 定义应用配置 */
export function _useAppConfig(app: App, cfg?: any, type?: AppConfigType) {
  if (!cfg) return cfg

  let _cfg = cfg

  const cfgType = type || _cfg.__app_cfg_type

  if (_.isFunction(cfg) && cfgType) {
    _cfg = cfg(app)

    // api配置不支持嵌套，这里直接返回
    if (cfgType === AppConfigType.API) return _cfg
  }

  if (_.isPlainObject(_cfg)) {
    // 防止修改原始数据
    _cfg = { ..._cfg }

    Object.keys(_cfg).forEach(key => {
      _cfg[key] = _useAppConfig(app, _cfg[key])
    })
  } else if (Array.isArray(_cfg)) {
    _cfg = _cfg.map(it => _useAppConfig(app, it))
  }

  return _cfg
}

import { AppConfigType } from '../../consts'
import { _ } from '../../utils'
import { _useAppConfig } from './use-config'

import type {
  AppApiDefinition,
  AppApi,
  AppConfigDefinition,
  UseApiConfigMethod,
  UseAppConfigMethod
} from '../../typings'

import type { PartialPageSchema } from '@zto/zpage-core'
import type { App } from '../App'

/** 定义应用配置 */
export function defineAppConfig<T>(config: AppConfigDefinition<T>) {
  return _defineAppConfig<UseAppConfigMethod<T>>(config, AppConfigType.APP)
}

/** 定义应用Api配置 */
export function defineAppApi<T extends AppApi = AppApi>(config: AppApiDefinition<T>) {
  return _defineAppConfig<UseApiConfigMethod<T>>(config, AppConfigType.API)
}

/** 定义页面配置配置 */
export function defineAppPage<T extends PartialPageSchema = PartialPageSchema>(config: Record<string, any>) {
  return _defineAppConfig<UseAppConfigMethod<T>>(config, AppConfigType.PAGE)
}

/** 定义Widget配置 */
export function defineAppWidget<T>(config: Record<string, any>) {
  return _defineAppConfig<UseAppConfigMethod<T>>(config, AppConfigType.WIDGET)
}

/** 定义Cmpt配置 */
export function defineAppCmpt<T>(config: Record<string, any>) {
  return _defineAppConfig<UseAppConfigMethod<T>>(config, AppConfigType.CMPT)
}

/** 定义应用插件 */
export function defineAppPlugin<T>(config: Record<string, any>) {
  return _defineAppConfig<UseAppConfigMethod<T>>(config, AppConfigType.PLUGIN)
}

/** 定义应用配置 */
function _defineAppConfig<T = UseAppConfigMethod>(config: any, type: AppConfigType): T {
  function useConfig(app: App) {
    return _useAppConfig(app, config, type)
  }

  useConfig.__app_cfg_type = type

  return useConfig as any as T
}

import { _ } from '../utils/util'
import type { RuntimeConfig, ApiRequest } from '../typings'

let __config = {} as RuntimeConfig

/** 设置配置 */
export const setConfig = (config: RuntimeConfig): void => {
  __config = _.deepFreeze(config)
}

/** 获取配置 */
export const useConfig = (path: string, defaultValue?: unknown): any => {
  const cfg = _.get(__config, path, defaultValue)
  return _.deepClone(cfg)
}

/** 获取环境信息 */
export const useEnv = (name?: string) => {
  const section = name ? `env.${name}` : 'env'
  return useConfig(section)
}

/** 获取apis */
export const useApis = () => {
  return useConfig('apis')
}

/** 获取api */
export const useApi = (name: string) => {
  return useConfig(`apis.${name}`)
}

/**
 * 获取api请求方法
 * @returns
 */
export function useApiRequest<T = ApiRequest>() {
  return useConfig('app.api.request') as T
}

/** 获取资源 */
export const useRescs = (path?: string, defaultValue?: unknown) => {
  const _path = path ? `.${path}` : ''
  return useConfig(`rescs${_path}`, defaultValue)
}
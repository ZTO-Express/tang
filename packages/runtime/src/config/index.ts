import { _ } from '../utils/util'
import type { RuntimeConfig, ApiRequest } from '../typings'

let __config = {} as RuntimeConfig

/** 设置配置 */
export const setConfig = (config: RuntimeConfig): void => {
  __config = Object.freeze(config)
}

/** 获取配置 */
export const useConfig = (path: string, defaultValue?: unknown): any => {
  const cfg = _.get(__config, path, defaultValue)
  return cfg
}

/**
 * 获取api请求方法
 * @returns
 */
export function useAppConfig(path: string, defaultValue?: unknown) {
  const _path = path ? `.${path}` : ''
  return useConfig(`app${_path}`, defaultValue)
}

/**
 * 获取微件配置
 * @param path
 * @param defaultValue
 */
export function useWidgetsConfig(path: string, defaultValue?: unknown) {
  const _path = path ? `.${path}` : ''
  return useConfig(`widgets${_path}`, defaultValue)
}

/**
 * 获取微件配置
 * @param path
 * @param defaultValue
 */
export function useComponentsConfig(path: string, defaultValue?: unknown) {
  const _path = path ? `.${path}` : ''
  return useConfig(`components${_path}`, defaultValue)
}

/**
 * 获取api请求方法
 * @returns
 */
export function useApiRequest<T = ApiRequest>() {
  return useAppConfig('api.request') as T
}

/** 获取环境信息 */
export function useEnv<T = any>(envName?: string): T {
  const section = envName ? `env.${envName}` : 'env'
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

/** 获取资源 */
export const useRescs = (path?: string, defaultValue?: unknown) => {
  const _path = path ? `.${path}` : ''
  return useConfig(`rescs${_path}`, defaultValue)
}

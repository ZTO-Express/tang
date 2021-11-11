import { _ } from '../utils/util'
import type { AppConfig, ApiRequest } from '../typings'

let $APP = {} as AppConfig

/** 设置配置 */
export const setConfig = (config: AppConfig): void => {
  $APP = config
}

/** 获取配置 */
export const useConfig = (path: string, defaultValue?: unknown): any => {
  return _.get($APP, path, defaultValue)
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

/** 获取pages */
export const usePages = () => {
  return useConfig('pages')
}

/** 获取页面 */
export const usePage = (path: string) => {
  const pages = usePages()

  if (!pages?.length) return undefined

  const page = pages.find((it: any) => it?.path === path)
  return page
}

/** 获取资源 */
export const useRescs = (path?: string) => {
  const _path = path ? `.${path}` : ''
  return useConfig(`rescs${_path}`)
}

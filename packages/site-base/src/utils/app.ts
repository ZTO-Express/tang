import { _ } from '@zto/zpage'

import type { VueComponent, AppPageDefinition, AppEnvMap } from '@zto/zpage'
import type { GlobMap } from '../typings/app'

/** 获取当前环境变量 */
export function getCurrentEnvFromEnvMap<T>(envMap?: AppEnvMap<T>): T | undefined {
  if (!envMap) return undefined

  const envNames = Object.keys(envMap)

  let envName = envNames.find(key => {
    const _env = envMap[key]
    return _env && _env.HOSTs && _env.HOSTs.some(h => checkHrefHost(h))
  })

  if (!envName) envName = envNames[0] // 默认环境

  const env = (envMap[envName] || {}).ENV
  return { name: envName, ...env } as unknown as T
}

/** 检查当前href是否为指定的host */
export function checkHrefHost(host: string) {
  const href = window.location.href
  const hostIndex = href.indexOf(host)

  if (hostIndex === 0 || ['https://', 'http://'].includes(href.substring(0, hostIndex))) return true

  return false
}

/** 根据Glob Map获取扩展对象数组 */
export function getComponentsFromGlobMap<T = VueComponent>(itemsMap: Record<string, any>): T[] {
  const items: T[] = _.objectToArray(itemsMap, (it: any, key: string) => {
    const cmpt = it.default
    cmpt.name = cmpt.name || key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.'))

    return cmpt
  })

  return items
}

/** 根据Glob Map获取扩展对象数组 */
export function getComponentsFromMap<T = VueComponent>(itemsMap: Record<string, any>): T[] {
  const items: T[] = _.objectToArray(itemsMap, (it: any, key: string) => {
    const cmpt = it.default || it
    cmpt.name = cmpt.name || key

    return cmpt
  })

  return items
}

/** 获取组件记录 */
export function getComponentsRecords(components: VueComponent[]) {
  return components.reduce((acc, cmpt) => {
    acc[cmpt.name as string] = cmpt
    return acc
  }, {} as Record<string, VueComponent>)
}

export interface GetPagesFromGlobMapOptions {
  basePath?: string
  indexPostfix?: string
}

/**
 * 由页面的Glob Map获取页面数组
 * @param pagesMap
 * @param options
 */
export function getPagesFromGlobMap(
  pagesMap: GlobMap<AppPageDefinition>,
  options: GetPagesFromGlobMapOptions = {}
): AppPageDefinition[] {
  options = { basePath: '../pages', indexPostfix: '/index.ts', ...options }

  const indexFile = `${options.basePath}${options.indexPostfix}`

  // 预处理导出页面
  const pages = _.objectToArray(pagesMap, (item, key: string) => {
    // index文件不导出
    if (key === indexFile) return undefined

    const page = item.default || item.page
    if (!page) return undefined

    if (!page.path) page.path = _getPagePathByPageKey(key, options as any)
    return page
  }).filter((page: any) => !!page)

  return pages as AppPageDefinition[]
}

function _getPagePathByPageKey(key: string, options: Required<GetPagesFromGlobMapOptions>) {
  if (!key) return key

  const { basePath, indexPostfix } = options

  let path = key.substring(basePath.length)

  if (path.endsWith(indexPostfix)) {
    path = path.substring(0, path.length - indexPostfix.length)
  } else if (path.endsWith('.ts')) {
    path = path.substring(0, path.length - '.ts'.length)
  }

  return path
}

import { defineStore as definePiniaStore, _GettersTree } from 'pinia'

import { STORE_NAME } from '../../consts'
import { _ } from '../../utils'

import type { DefineStoreOptions } from 'pinia'
import type { SetDataOptions } from '../../typings'

/** 根据storeName获取id */
export function getStoreId(appName: string, storeName: STORE_NAME) {
  return `${appName}_${storeName}`
}

/** 定义应用Store */
export function defineStore<S, G extends _GettersTree<S> = {}, A = {}>(
  storeName: STORE_NAME,
  options: Omit<DefineStoreOptions<string, S, G, A>, 'id'>
) {
  const storeId = getStoreId(options.appName, storeName)

  return definePiniaStore<string, S, G, A>(storeId, options)
}

/** 设置数据 */
export function setData(targetData: any, options: SetDataOptions) {
  const { data } = options

  const path = options.path || ''
  const type = options.type || 'set'

  targetData = targetData || {}

  switch (type) {
    case 'set':
      _.set(targetData, path, data)
      break
    case 'unset':
      _.unset(targetData, path)
      break
    case 'init':
    case 'reset':
      targetData = data
      break
    case 'merge':
      targetData = Object.assign(targetData, data)
      break
    case 'deepMerge':
      targetData = _.deepMerge(targetData, data)
      break
    case 'clear':
      targetData = undefined
      break
  }

  return targetData
}

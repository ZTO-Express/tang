import { _, HostApp } from '@zto/zpage'

import { UI_GLOBAL_EVENTS } from '../consts'

/** 打开下载列表对话框 */
export function openDownloadsDialog() {
  if (!HostApp.app) throw new Error('主应用未初始化')

  HostApp.app?.emitter.emit(UI_GLOBAL_EVENTS.OPEN_DOWNLOADS)
}

/**
 * 获取表单上下文
 * @param payload
 * @param context
 * @returns
 */
export function getActionPayload(payload: any, context: any) {
  if (_.isFunction(payload)) {
    return payload(context)
  } else if (Array.isArray(payload)) {
    const result = payload.reduce((acc: any, key: string) => {
      if (key) acc[key] = _.get(context, key)
      return acc
    }, {})
    return result
  } else {
    return payload
  }
}

export interface CmptPermOptions {
  perm?: boolean | string // 权限开关/权限设置标记
  perms?: string | string[] // 权限数组
  api?: any
  [key: string]: any
}

/**
 * 获取组件权限数据
 * @param options
 * @returns
 */
export function getCmptPermData(options: CmptPermOptions) {
  // 没有权限配置，则直接返回
  if (!options) return null

  // 关闭权限配置，则直接返回
  if (options.perm == false) return null

  if (options.perms) return Array.isArray(options.perms) ? options.perms : [options.perms]

  if (!options.perm) return null

  if (_.isString(options.perm)) return [options.perm]

  if (options.perm === true && options.api) {
    if (_.isString(options.api)) return [options.api]
    if (_.isString(options.api.api)) return [options.api.api]
  }

  return null
}

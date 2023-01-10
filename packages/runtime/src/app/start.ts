import { APP_NAME_PATTERN } from '../consts'
import { normalizeAppStartOptions } from './options'
import { App } from './App'
import { HostApp } from './HostApp'
import { _ } from '../utils'

import type { AppCtorOptions, AppStartOptions } from '../typings'

/**
 * 创建应用
 * @param options 应用选项
 * @returns
 */
export async function startApp(options: AppStartOptions) {
  // 检查启动项
  checkAppStartOptions(options)

  // 标准化配置
  const startOptions = normalizeAppStartOptions(options)

  const app = createApp(options)

  // 初始化 埋点
  try {
    if (options.initTrace) options.initTrace(app, options)
  } catch (error) {
    console.log(error)
  }

  // 直接设置元应用入口（主要用于调试或单独启动元应用的情况）
  if (options.meta) window[options.name] = { meta: options.meta }

  // 载入应用页面
  await app.start(startOptions)

  return app
}

/** 检查应用名称是否合法 */
export function checkAppStartOptions(options: AppStartOptions) {
  if (!options.name) throw new Error('应用名称不能为空！')

  if (!APP_NAME_PATTERN.test(options.name)) throw new Error('应用名称必须是以字母开头，且只能包含字母数字和下划线！')

  return true
}

/**
 * 创建应用
 * @param options
 * @returns
 */
export function createApp(options: AppCtorOptions) {
  if (!_.isBoolean(options.isMicro)) options.isMicro = false

  if (!options.isMicro && !options.isDebug && HostApp.isInitialized) {
    throw new Error('宿主应用已经存在，无法重复创建。')
  }

  const app = !options.isMicro ? HostApp.initialize(options) : new App(options)
  return app
}

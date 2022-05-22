import { normalizeAppStartOptions } from './options'
import { App } from './App'
import { HostApp } from './HostApp'

import type { AppCtorOptions, AppStartOptions } from '../typings'
import { APP_NAME_PATTERN } from '../consts'

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
  if (options.isHost && HostApp.isInitialized) {
    throw new Error('宿主应用已经初始化过了。')
  }

  const app = options.isHost ? HostApp.initialize(options) : new App(options)
  return app
}

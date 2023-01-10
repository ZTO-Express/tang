import { _, vue, mergeAppStartOptions, ZPage, ZPageRuntime } from '@zto/zpage'
import { ZPageElementUI } from '@zto/zpage-ui-element'

import * as ZPageSiteBase from './ZPageSiteBase'

import configs from './config'

import { extensions } from './extensions'
import { components } from './components'
import { widgets } from './widgets'

import { getCurrentEnvFromEnvMap } from './utils'

import type { SiteAppStartOptions } from './typings'

/** 启动应用 */
export async function startSiteApp(options: SiteAppStartOptions) {
  // 支持微应用全局变量
  if (!window.Vue) window.Vue = vue
  if (!window.ZPage) window.ZPage = ZPage
  if (!window.ZPageRuntime) window.ZPageRuntime = ZPageRuntime
  if (!window.ZPageElementUI) window.ZPageElementUI = ZPageElementUI
  if (!window.ZPageSiteBase) window.ZPageSiteBase = ZPageSiteBase

  const startOptions = getAppStartOptions(options)

  // 处理配置
  if (options.beforeStart) options.beforeStart(startOptions, options)

  // 启动应用
  const app = await ZPage.startApp(startOptions)
  return app
}

/** 获取应用配置 */
export function getAppStartOptions(options: SiteAppStartOptions) {
  const opts = _.omit(options, ['beforeStart', 'config', 'envMap'])
  opts.container = options.container || `#${options.name}`

  const appConfigs = [{ ...configs }, { ...options.config }]

  opts.env = getCurrentEnvFromEnvMap(options.envMap)

  const mergedOptions = mergeAppStartOptions(
    {
      ui: { ...ZPageElementUI },
      extensions: { components, widgets, ...extensions }
    },
    opts
  )

  opts.pages = opts.pages || []

  // 默认附加welcome页面
  if (!opts.pages.some((page: any) => page.path === '/welcome')) {
    opts.pages.push({ path: '/welcome', type: 'welcome' })
  }

  mergedOptions.configs = appConfigs

  return mergedOptions
}

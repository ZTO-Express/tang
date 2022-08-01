import { startSiteApp } from '@zto/zpage-site-base'

import { APP_NAME } from './consts'
import { envMap } from './env'

import { config, menus, extensions } from './config'

import { pages } from './pages'
import { components } from './components'
import { widgets } from './widgets'

/** 启动战队应用 */
startSiteApp({
  name: APP_NAME,
  envMap,
  pages,
  config: { ...config, menus },
  extensions: { ...extensions, components, widgets }
})

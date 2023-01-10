import { startSiteApp } from '@zto/zpage-site-base'

import { APP_NAME } from './consts'
import { envMap } from './env'

import { config, apis, menus, extensions } from './config'

import { pages } from './pages'
import { components } from './components'
import { widgets } from './widgets'
import './index.scss'

// 加载monaco编辑器
import './config/vendors/monaco'

/** 启动战队应用 */
startSiteApp({
  name: APP_NAME,
  envMap,
  pages,
  config: { ...config, apis, menus },
  extensions: { ...extensions, components, widgets }
})

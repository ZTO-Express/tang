import { startSiteApp } from '@zto/zpage-site-base'

import VueHighlightJS from 'vue3-highlightjs'
import 'highlight.js/styles/solarized-light.css'

import { APP_NAME } from './consts'
import { envMap } from './env'

import { config, apis, menus, extensions } from './config'

import { pages } from './pages'
import { components } from './components'
import { widgets } from './widgets'
import './index.scss'

// 加载monaco编辑器
import './config/vendors/monaco'
;(async () => {
  /** 启动战队应用 */
  const app = await startSiteApp({
    name: APP_NAME,
    envMap,
    pages,
    config: { ...config, apis, menus },
    extensions: { ...extensions, components, widgets }
  })

  app.vueApp.use(VueHighlightJS)
})()

import { startApp } from '@zpage/zpage'
import { ZPageVantUI } from '@zpage/ui-vant'

import { ENV } from './config/env'

import appCfg from './config/app'
import widgetsCfg from './config/widgets'
import componentsCfg from './config/components'
import { menus } from './config/menus'

import { components } from './components'
import { widgets } from './widgets'
import { pages } from './pages'

import * as apis from './apis'

import AppTheme from './components/app/AppTheme.vue'

startApp({
  el: '#app',
  ui: { ...ZPageVantUI, AppTheme },
  config: {
    env: ENV,
    apis,
    pages,
    menus,
    app: { ...appCfg },
    widgets: { ...widgetsCfg },
    components: { ...componentsCfg }
  },
  extends: {
    components,
    widgets
  }
})

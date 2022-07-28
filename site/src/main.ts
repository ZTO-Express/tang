import { startSiteApp } from '@zto/zpage-site-base'

import { APP_NAME } from './consts'
import { envMap } from './env'

/** 启动战队应用 */
startSiteApp({
  name: APP_NAME,
  envMap
})

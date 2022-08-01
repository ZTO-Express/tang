import { APP_TITLE } from '@/consts'

import type { AppAppConfig } from '@zto/zpage'

export const app: AppAppConfig = {
  title: APP_TITLE,
  header: { extra: { component: 'c-app-header-extra' } },
  auth: { loader: 'local' },
  page: { loader: 'site-doc' }
}

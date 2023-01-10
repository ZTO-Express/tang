import { _, uuid, defineAppConfig } from '@zto/zpage'

import type { App, AppAppApiConfig, ApiRequestAction, ApiRequestConfig } from '@zto/zpage'

export default defineAppConfig<AppAppApiConfig>((app: App) => {
  return {
    async onRequest(action: ApiRequestAction, config: ApiRequestConfig) {
      if (action.api?.startsWith('/fixtures/data')) {
        const result = await import(`../../../${action.api}.ts`)

        return { returnResponse: true, response: result.default || result }
      }
    }
  }
})

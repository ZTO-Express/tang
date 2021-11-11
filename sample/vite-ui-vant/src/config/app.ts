import logo from '@/assets/logo.png'

import { useApi } from '@zpage/zpage'

export default {
  title: '兔喜共配',
  logo,
  page: {
    loader: 'local'
  },
  auth: false,
  api: {
    request: async (config: any) => {
      if (!config) return
      let { action, params, data } = config

      if (typeof action === 'string') {
        action = {
          api: action
        }
      }

      let postData = params || data

      if (action.type === 'query') {
        const { pageIndex, pageSize } = config

        postData = {
          pageIndex,
          pageSize,
          condition: {
            ...(params || {})
          }
        }
      }

      const cdcApi = useApi('cdc')
      const res = await cdcApi.post(action.api, postData)
      return res
    }
  }
}

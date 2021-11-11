import * as apis from '../apis'

import logo from '@/assets/logo.png'
import welcomePic from '@/assets/welcome.png'

export default {
  title: 'ZPage Sample',
  assets: {
    logo,
    welcomePic
  },
  menu: {},
  page: {
    loader: 'local'
  },
  auth: {
    loader: 'local'
  },
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
        const { pageIndex, pageSize, noPager } = config

        Object.keys(postData).forEach(key => {
          // 清理查询空格
          if (typeof postData[key] === 'string') {
            postData[key] = postData[key].trim()
          }
        })

        if (noPager) {
          postData = { ...(postData || {}) }
        } else {
          postData = {
            pageIndex,
            pageSize,
            ...(postData || {})
          }
        }
      }

      const fetchConfig: any = {
        url: action.api,
        method: action.method || 'GET',
        data: postData
      }

      if (['GET', 'get'].includes(fetchConfig.method)) {
        fetchConfig.params = postData
      }

      const res = await apis.app.fetch(fetchConfig)

      return res
    }
  }
}

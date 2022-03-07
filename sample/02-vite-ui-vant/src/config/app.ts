import { useApi } from '@zto/zpage'
import { ENV } from './env'

import logo from '@/assets/logo.png'
import welcomePic from '@/assets/welcome.png'

export default {
  title: 'ZPage Sample H5',
  assets: {
    logo,
    welcomePic
  },
  page: {
    loader: 'local'
  },
  auth: false,
  api: {
    request: async (options: any) => {
      if (!options) return

      let { api, action, params, data } = options
      action = action || api

      if (typeof action === 'string') action = { url: action }
      if (typeof action.api === 'string') action.url = action.url || action.api
      else if (action.api) action = { ...action.api, ...action }

      // 如果设置了mockData则返回mock数据
      if (ENV.env === 'dev' && action.mockData) return action.mockData

      let postData = params || data

      if (action.type === 'query' || action.type === 'fuzzy-select') {
        const { pageIndex, pageSize, noPager } = options

        // 清理查询空格
        Object.keys(postData).forEach(key => {
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
            ...postData
          }
        }
      }

      if (action.requestTransform) postData = action.requestTransform(postData)

      const fetchOptions: any = {
        url: action.url,
        method: action.method || 'POST',
        data: postData
      }

      if (['GET', 'get'].includes(fetchOptions.method)) {
        fetchOptions.params = postData
      }

      const appApi = useApi('app')
      const res = await appApi.fetch(fetchOptions)

      if (action.responseTransform) return action.responseTransform(res)

      return res
    }
  }
}

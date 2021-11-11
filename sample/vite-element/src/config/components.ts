import * as apis from '../apis'

export default {
  fuzzySelect: {
    remoteMethod: async (keyword: string, payload: any) => {
      if (!payload) return
      const { api, method, pageIndex, pageSize, params, noPager } = payload

      let postData = { keyword: (keyword || '').trim(), ...params }

      if (!noPager) {
        postData = {
          condition: {
            keyword: (keyword || '').trim(),
            ...params
          },
          pageIndex: pageIndex || 1,
          pageSize: pageSize || 40
        }
      }

      const res = await apis.app.fetch({
        url: api,
        method: method || 'GET',
        data: postData
      })

      return res
    }
  },
  pagination: {
    layout: 'sizes, prev, pager, next, jumper, ->, total',
    pageSizes: [10, 15, 50, 100],
    pageSize: 15
  }
}

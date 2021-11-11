import * as apis from '../apis'

export default {
  fuzzySelect: {
    remoteMethod: async (keyword: string, payload: any) => {
      if (!payload) return
      const { api, pageIndex, pageSize, params } = payload
      const res = await apis.cdc.post(api, {
        condition: {
          keyword: (keyword || '').trim(),
          ...params
        },
        pageIndex: pageIndex || 1,
        pageSize: pageSize || 40
      })
      return res
    }
  }
}

import * as apis from '../apis'

export default {
  crud: {
    adapter: {
      request: async (payload: any) => {
        if (!payload) return
        const { action, params, pageIndex, pageSize } = payload

        let data = params
        if (action.type === 'query') {
          data = {
            pageIndex,
            pageSize,
            condition: {
              ...(params || {})
            }
          }
        }

        const res = await apis.app.post(action.api, data)
        return res
      }
    }
  }
}

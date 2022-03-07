const { useApi } = ZPage

export default {
  crud: {
    adapter: {
      request: async (payload: any) => {
        const appApi = useApi('app')

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

        const res = await appApi.post(action.api, data)
        return res
      }
    }
  }
}

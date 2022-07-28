import { _, uuid, defineAppConfig } from '@zto/zpage'

import { HTTP_STATUS_CODES } from '../../consts'

import type { App, AppAppApiConfig, ApiRequestConfig } from '@zto/zpage'

export default defineAppConfig<AppAppApiConfig>((app: App) => {
  return {
    baseUrl: app.env.apiUrl,

    inner: { timeout: 5000 },

    request: async (config: ApiRequestConfig) => {
      if (!config) return

      const env = app.env

      let { url, api, action, params, data } = config
      action = action || api || url

      if (!action) return

      if (typeof action === 'string') action = { url: action }
      if (typeof action.api === 'string') action.url = action.url || action.api
      else if (action.api) action = { ...action.api, ...action }

      // 如果设置了mockData则返回mock数据
      if (env.name === 'dev' && action.mockData) return action.mockData

      let postData = params || data || {}

      if (action.type === 'query' || action.type === 'fuzzy-select') {
        const { pageIndex, pageSize, noPager } = config

        // 清理查询空格
        Object.keys(postData).forEach(key => {
          if (typeof postData[key] === 'string') {
            postData[key] = postData[key].trim()
          }
        })

        // 如果设置了uniqueApiParamProp且uniqueApiParamProp存在值，则只传输uniqueApiParamProp
        if (action.uniqueApiParamProp && postData[action.uniqueApiParamProp]) {
          postData = { [action.uniqueApiParamProp]: postData[action.uniqueApiParamProp] }
        }

        if (noPager) {
          postData = { ...(postData || {}) }
        } else {
          postData = { pageIndex, pageSize, ...postData }
        }
      }

      if (action.transform?.request) postData = action.transform?.request(postData, action)
      if (action.requestTransform) postData = action.requestTransform(postData, action)

      // 根据url获取命名空间
      if (_.isString(action.url)) {
        const { ns, url } = app.parseApiUrl(action.url)

        if (ns) {
          action.ns = ns
          action.url = url
        }
      }

      const fetchConfig: any = {
        url: action.url,
        method: action.method || 'POST',
        data: postData,
        rawConfig: config
      }

      if (['GET', 'get'].includes(fetchConfig.method)) {
        fetchConfig.params = postData
      }

      let reqApi = app.api
      if (action.ns) {
        reqApi = app.apis[action.ns] || app.apis[`${action.ns}Api`]

        if (!reqApi) throw new Error(`未找到Api命名空间${action.ns}。`)
      }

      let res = await reqApi.fetch(fetchConfig)

      if (action.transform?.response) res = action.transform?.response(res, action)
      if (action.responseTransform) res = action.responseTransform(res, action)

      return res
    },

    interceptors: {
      beforeRequest(config: any) {
        const Progress = app.useProgress()
        const env = app.env

        Progress.start()

        if (env.extraHeaders) config.headers = { ...env.extraHeaders, ...config.headers }

        config.headers['x-zop-ns'] = env.appNs
        config.headers['x-request-id'] = uuid()

        // 测试时可用其他token替换存储token
        if (!config.headers['x-iam-token']) {
          const token = app.token.getAccessToken()
          if (token) config.headers['x-iam-token'] = token
        }

        return config
      },

      requestError(error: any) {
        const Progress = app.useProgress()
        Progress.done()

        return Promise.reject(error)
      },

      afterResponse: async (response: any) => {
        const Progress = app.useProgress()
        const { Message } = app.useMessage()

        const env = app.env

        Progress.done()

        const cfg = response.config
        const res = response.data

        // 如果是mock环境，则直接设置status为true
        if (env.name === 'mock') res.status = true

        // 如果设置了mockData则返回mock数据
        if (env.name === 'dev' && cfg?.mockData) {
          res.status = true
          res.result = cfg.mockData
        }

        if (cfg.responseType === 'blob') return response
        if (res.status) return response
        const flag = await _dealWithFalseResponse(response, app)

        // 为true继续，false则直接返回
        if (!flag) return Promise.reject(res)

        // 设置isSlient标志不提示错误
        if (!cfg.isSilent && !cfg.rawConfig?.isSilent) {
          Message.error({
            type: 'error',
            message: res.message,
            showClose: true
          })
        }

        return Promise.reject(res)
      },

      afterFetchResponse: (response: any) => {
        return response.data?.result
      },

      responseError: (error: any) => {
        const Progress = app.useProgress()
        const { MessageBox } = app.useMessage()

        Progress.done()
        MessageBox.close()

        MessageBox.confirm('网络开小差了，请稍后重试～', '提示', {
          type: 'error',
          showCancelButton: false
        })

        return Promise.reject(error)
      }
    }
  }
})

/** 处理token问题 */
async function _dealWithFalseResponse(response: any, app: App) {
  const cfg = response.config
  const res = response.data

  const statusCode = res?.statusCode

  if (!Object.values(HTTP_STATUS_CODES).includes(statusCode)) return true

  const { MessageBox } = app.useMessage()

  let logoutMessage = res.message || '登录已失效，请重新登录'

  // 是否执行登出操作，默认执行 （0: 不登出，1: 登出）
  let logoutFlag = 1

  switch (statusCode) {
    case HTTP_STATUS_CODES.EMPTY_PARAM:
      // Token为空直接登出
      if (!app.token.getAccessToken()) return app.logout()
      return true
    case HTTP_STATUS_CODES.IAM_TOKEN_EXPIRED:
    case HTTP_STATUS_CODES.SSO_TOKEN_EXPIRED:
      await app.token
        .refresh()
        .then(() => {
          /** 刷新token成功，不再登出 */
          logoutFlag = 0

          // 如若获取用户信息接口失败，则直接刷新
          if (cfg?.url === 'base.getCurrentUserInfo') {
            location.reload()
          }
        })
        .catch((err: any) => {
          logoutMessage = '登录过期'
        })
      break
    case HTTP_STATUS_CODES.JWT_TOKEN_INVALID:
      logoutMessage = '登录无效'
      break
  }

  if (
    [HTTP_STATUS_CODES.INVALID_CODE, HTTP_STATUS_CODES.USER_DISABLED, HTTP_STATUS_CODES.SSO_ERROR].includes(statusCode)
  ) {
    logoutFlag = 1
    logoutMessage = `${res.message || '账号验证错误'}`
  }

  if (!logoutFlag) return false

  await MessageBox.confirm(`${logoutMessage}，请重新登陆`, '提示', {
    type: 'error',
    showCancelButton: false,
    closeOnClickModal: false
  }).then(() => {
    // 跳转登录页
    return app.logout()
  })

  return true
}

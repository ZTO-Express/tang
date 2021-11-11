/** FFB标识器 */
export const FFB_INDENTITY = '$'

let __processors = {}

/** 注册ffb处理器 */
export function use(__process: any) {
  __processors = __process || {}
}

/** 是否api ffb */
export function isFfbApi(api: string) {
  return api && api.endsWith(FFB_INDENTITY)
}

/** 解析 */
export function parseFfbApi(api: string) {
  const processor = (__processors as any)[api]

  if (!processor) return undefined

  const realApi = api.substring(0, api.indexOf(FFB_INDENTITY))

  return {
    name: api,
    api: realApi,
    ...processor
  }
}

/** 获取Ffb处理器 */
export function interceptFfbRequest(cfg: any) {
  const api = cfg?.url
  if (!isFfbApi(api)) return cfg

  const ffbConfig = parseFfbApi(api)
  if (!ffbConfig) return cfg

  cfg.url = ffbConfig.api // 设置实际请求api
  cfg.ffb_config = ffbConfig
  if (ffbConfig.beforeRequest) ffbConfig.beforeRequest(cfg)

  return cfg
}

/** 获取Ffb处理器 */
export function interceptFfbResponse(response: any) {
  const cfg = response.config
  const api = cfg.url
  const ffbConfig = cfg.ffb_config

  if (!ffbConfig) return response

  if (ffbConfig.afterResponse) ffbConfig.afterResponse(response)

  return response
}

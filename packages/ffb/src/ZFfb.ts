/** FFB标识器 */
export const FFB_INDENTITY = '$'

export interface FfbProcessor {
  beforeRequest?: (config: any) => void
  afterResponse?: (response: any) => any
}

export class ZFfb {
  readonly identity = FFB_INDENTITY

  constructor(processors?: Record<string, FfbProcessor>) {
    this._processors = { ...this._processors, ...processors }
  }

  private _processors = {}

  /** 注册ffb处理器 */
  use(processors: Record<string, FfbProcessor>) {
    this._processors = { ...this._processors, ...processors }
  }

  /** 是否api ffb */
  static isFfbApi(api: string) {
    return api && api.endsWith(FFB_INDENTITY)
  }

  /** 解析 */
  parseFfbApi(api: string) {
    const processor = (this._processors as any)[api]

    if (!processor) return undefined

    const realApi = api.substring(0, api.indexOf(FFB_INDENTITY))

    return {
      name: api,
      api: realApi,
      ...processor
    }
  }

  /** 获取Ffb处理器 */
  interceptFfbRequest(cfg: any) {
    const api = cfg?.url
    if (!ZFfb.isFfbApi(api)) return cfg

    const ffbConfig = this.parseFfbApi(api)
    if (!ffbConfig) return cfg

    cfg.url = ffbConfig.api // 设置实际请求api
    cfg.ffb_config = ffbConfig

    if (ffbConfig.beforeRequest) {
      ffbConfig.beforeRequest(cfg)
    }

    return cfg
  }

  /** 获取Ffb处理器 */
  interceptFfbResponse(response: any) {
    const cfg = response.config
    const ffbConfig = cfg.ffb_config

    if (!ffbConfig) return response

    if (ffbConfig.afterResponse) ffbConfig.afterResponse(response)

    return response
  }
}

import { TOKEN_DATA_STORAGE_KEY, TOKEN_REFRESH_DURATION } from '../../consts'
import { AppInterior } from './AppInterior'
import { storage } from '../../utils'

import type { App } from '../App'
import type { Nil, TokenData } from '../../typings'

/**
 * 应用Token管理器
 * 涉及到应用token的部分，只能调用宿主应用
 */
export class InternalAppToken extends AppInterior<InternalAppToken> {
  protected static _instance: InternalAppToken

  private _config: any // token相关配置
  private _tokenRefreshTimer: any = null // token刷新时间

  readonly refreshDuration: number // 更新时间(单位秒)
  readonly autoRefresh: boolean // 是否自动刷新(默认否)

  private constructor(app: App) {
    super(app)

    // 当前token自动刷新时间
    this._config = this.hostApp.useConfig('app.auth.token', {})

    this.refreshDuration = this._config.refreshDuration || TOKEN_REFRESH_DURATION
    this.autoRefresh = this._config.autoRefresh === true
  }

  /** 获取Token实例 */
  static retrieveInstance(app: App) {
    if (InternalAppToken._instance) return InternalAppToken._instance

    const hostApp = app.useHostApp()

    if (!app.isIndependent) return hostApp.token

    InternalAppToken._instance = new InternalAppToken(app)
    return InternalAppToken._instance
  }

  /**
   * 检查并启用token自动刷新
   * @param flag true:启用刷新, false: 禁用刷新
   * @returns
   */
  checkStartAutoRefresh(flag = true) {
    if (!this.checkIndependent() || this._tokenRefreshTimer) return

    // 自否自动刷新token
    if (flag === false) {
      if (this._tokenRefreshTimer) {
        clearTimeout(this._tokenRefreshTimer)
        this._tokenRefreshTimer = null
      }
      return
    }

    if (this.autoRefresh) {
      this._tokenRefreshTimer = setInterval(this.refresh.bind(this), this.refreshDuration * 1000)
    }
  }

  /**
   * 检查token，并根据刷新间隔刷新token，防止token过期
   * @returns
   */
  async checkRefresh() {
    if (!this.checkIndependent()) return

    const tokenData = this.getData()

    const requestTime = tokenData?.requestTime
    if (!requestTime) return

    if (new Date().getTime() - requestTime > this.refreshDuration) {
      await this.refresh()
    }
  }

  /**
   * 刷新token，如果提供了code，则通过code刷新，否则通过
   * @param code
   */
  async refresh(code?: string) {
    if (!this.checkIndependent()) return

    const authApi = this.hostApp.apis.authApi
    if (!authApi) return

    // 请求时间
    const requestTime = new Date().getTime()

    let tokenData: TokenData | null = null

    if (code) {
      if (authApi.getToken) {
        tokenData = await authApi.getToken(code)
      } else {
        tokenData = { accessToken: code }
      }
    } else {
      if (authApi.exchangeToken) {
        const refreshToken = this.getLocalRefreshToken()
        if (refreshToken) {
          tokenData = await authApi.exchangeToken(refreshToken)
        }
      }
    }

    if (tokenData) {
      tokenData.requestTime = requestTime
      this.saveData(tokenData)
    }
  }

  /**
   * 将local token里面的数据存储草page token里面，一般用于页面刷新后刷新页面token
   */
  reset() {
    if (!this.checkIndependent()) return

    const tokenData = this.getLocalData()
    if (tokenData) this.saveData(tokenData)
  }

  /**
   * 保存应用token
   * @param tokenData
   */
  saveData(tokenData: TokenData): void {
    if (!this.checkIndependent()) return

    if (!tokenData) return

    storage.local.set(TOKEN_DATA_STORAGE_KEY, tokenData)
    storage.page.set(TOKEN_DATA_STORAGE_KEY, tokenData)

    this.checkStartAutoRefresh()
  }

  /**
   * 清除token, 并终止自动刷新
   */
  clearData(): void {
    if (!this.checkIndependent()) return

    storage.local.remove(TOKEN_DATA_STORAGE_KEY)
    storage.page.remove(TOKEN_DATA_STORAGE_KEY)

    this.checkStartAutoRefresh(false)
  }

  /**
   * 获取tokenData
   * @returns
   */
  getData(): TokenData | Nil {
    return storage.page.get(TOKEN_DATA_STORAGE_KEY)
  }

  /**
   * 获取accessToken
   * @returns
   */
  getAccessToken(): string | Nil {
    const tokenData = this.getData()
    return tokenData?.accessToken
  }

  /**
   * 获取本地保存的tokenData
   * @returns
   */
  getLocalData(): TokenData | Nil {
    return storage.local.get(TOKEN_DATA_STORAGE_KEY)
  }

  /**
   *  获取本地保存的refresh token
   * @returns
   */
  getLocalRefreshToken(): string | Nil {
    const tokenData = this.getLocalData()
    return tokenData?.refreshToken
  }
}

import { TOKEN_DATA_STORAGE_KEY, TOKEN_REFRESH_DURATION } from '../consts'
import { HostApp } from '../app'
import { storage } from './storage'

import type { Nil } from '@zto/zpage-core'
import type { TokenData } from '../typings'

/** 获取token刷新间隔 */
export function getRefreshDuration() {
  const seconds = HostApp.useConfig('app.auth.token.refreshDuration') || TOKEN_REFRESH_DURATION
  return seconds * 1000
}

/** 启动定时刷新 */
let __tokenRefreshTimer: any = null
export function checkStartAutoRefresh(flag = true) {
  // 自否自动刷新token
  const autoRefresh = HostApp.useConfig('app.auth.token.autoRefresh')

  if (flag === false || autoRefresh) {
    __tokenRefreshTimer && clearTimeout(__tokenRefreshTimer)
  }

  if (autoRefresh) {
    const duration = getRefreshDuration()
    __tokenRefreshTimer = setInterval(refreshToken, duration)
  }
}

/**
 * 刷新token，如果提供了code，则通过code刷新，否则通过
 * @param code
 */
export async function refreshToken(code?: string) {
  const authApi = HostApp.app?.apis.authApi
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
      const refreshToken = getLocalRefreshToken()
      if (refreshToken) {
        tokenData = await authApi.exchangeToken(refreshToken)
      }
    }
  }

  if (tokenData) {
    tokenData.requestTime = requestTime
    saveTokenData(tokenData)
  }
}

/**
 * 将local token里面的数据存储草page token里面，一般用于页面刷新后刷新页面token
 */
export function resetToken() {
  const tokenData = getLocalTokenData()
  if (tokenData) saveTokenData(tokenData)
}

/**
 * 检查token，并根据刷新间隔刷新token，防止token过期
 * @returns
 */
export async function checkRefreshToken() {
  const tokenData = getTokenData()

  const requestTime = tokenData?.requestTime
  if (!requestTime) return

  if (new Date().getTime() - requestTime > getRefreshDuration()) {
    await refreshToken()
  }
}

/**
 * 保存应用token
 * @param tokenData
 */
export function saveTokenData(tokenData: TokenData) {
  if (!tokenData) return

  storage.local.set(TOKEN_DATA_STORAGE_KEY, tokenData)
  storage.page.set(TOKEN_DATA_STORAGE_KEY, tokenData)

  checkStartAutoRefresh()
}

/**
 * 清除token
 */
export function clearTokenData() {
  storage.local.remove(TOKEN_DATA_STORAGE_KEY)
  storage.page.remove(TOKEN_DATA_STORAGE_KEY)

  checkStartAutoRefresh(false)
}

/**
 * 获取tokenData
 * @returns
 */
export function getTokenData(): TokenData | Nil {
  return storage.page.get(TOKEN_DATA_STORAGE_KEY)
}

/**
 * 获取accessToken
 * @returns
 */
export function getAccessToken(): string | Nil {
  const tokenData = getTokenData()
  return tokenData?.accessToken
}

/**
 * 获取本地保存的tokenData
 * @returns
 */
export function getLocalTokenData(): TokenData | Nil {
  return storage.local.get(TOKEN_DATA_STORAGE_KEY)
}

/**
 *  获取本地保存的refresh token
 * @returns
 */
export function getLocalRefreshToken(): string | Nil {
  const tokenData = getLocalTokenData()
  return tokenData?.refreshToken
}

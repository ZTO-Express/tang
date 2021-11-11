import { TOKEN_DATA_STORAGE_KEY, TOKEN_REFRESH_DURATION } from '../consts'
import { useApi } from '../config'
import { storage } from './storage'

import type { TokenData } from '../typings'

/**
 * 刷新token，如果提供了code，则通过code刷新，否则通过
 * @param code
 */
export async function refreshToken(code?: string) {
  const userApi = useApi('user')

  // 请求时间
  const requestTime = new Date().getTime()

  let tokenData: TokenData | null = null

  if (code) {
    if (userApi.getToken) {
      tokenData = await userApi.getToken(code)
    } else {
      tokenData = {
        accessToken: code
      }
    }
  } else {
    if (userApi.exchangeToken) {
      const refreshToken = getLocalRefreshToken()
      tokenData = await userApi.exchangeToken(refreshToken)
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
export async function checkRereshToken() {
  const tokenData = getTokenData()

  const requestTime = tokenData?.requestTime

  if (!requestTime) return

  if (new Date().getTime() - requestTime > TOKEN_REFRESH_DURATION) {
    refreshToken()
  }
}

/**
 * 保存应用token
 * @param tokenData
 */
export function saveTokenData(tokenData: TokenData) {
  storage.local.set(TOKEN_DATA_STORAGE_KEY, tokenData)
  storage.page.set(TOKEN_DATA_STORAGE_KEY, tokenData)
}

/**
 * 清除token
 */
export function clearTokenData() {
  storage.local.remove(TOKEN_DATA_STORAGE_KEY)
  storage.page.remove(TOKEN_DATA_STORAGE_KEY)
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

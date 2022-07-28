import { AppLoaderType } from '../../consts'
import { AppInterior } from './AppInterior'

import type { AppAuthApi, AppAuthLoader } from '../../typings'
import type { App } from '../App'

/**
 * 应用权限
 * 涉及到应用权限的部分，只能调用宿主应用
 */
export class InternalAppAuth extends AppInterior<InternalAppAuth> {
  protected static _instance: InternalAppAuth

  readonly authLoader?: AppAuthLoader
  readonly authApi: AppAuthApi

  private constructor(app: App) {
    super(app)

    this.authApi = this.hostApp.apis.authApi
    this.authLoader = this.useAuthLoader()
  }

  /** 获取应用权限实例 */
  static retrieveInstance(app: App) {
    if (InternalAppAuth._instance) return InternalAppAuth._instance

    const hostApp = app.useHostApp()

    if (!app.isIndependent) return hostApp.auth

    InternalAppAuth._instance = new InternalAppAuth(app)
    return InternalAppAuth._instance
  }

  /** 应用认证加载期 */
  useAuthLoader(name?: string) {
    const hostApp = this.hostApp

    if (!name) name = hostApp.useAppConfig('auth', {}).loader
    if (!name) return undefined

    return hostApp.useLoader<AppAuthLoader>(AppLoaderType.AUTH, name)
  }

  /** 检查权限 */
  checkPermission(codes: string | string[]) {
    return this.authApi.checkPermission!(codes)
  }

  /** 检查认证只能有宿主应用进行调用 */
  async checkStartAuth() {
    if (!this.checkIndependent()) return

    if (this.authLoader) {
      await this.authLoader.checkAuth(this.app)
    }
  }

  async getUserInfo(...args: any[]) {
    return this.authLoader?.getUserInfo(this.app, ...args)
  }

  async getMenuData() {
    return this.authLoader?.getMenuData(this.app)
  }

  async logout() {
    return this.authLoader?.logout(this.app)
  }
}

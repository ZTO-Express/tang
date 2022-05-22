import { App } from './App'

import type { AppCtorOptions } from '../typings'

/**
 * 宿主应用
 */
export class HostApp {
  // 单例
  private static __instance: HostApp | null = null

  private _app: App

  private constructor(options: AppCtorOptions) {
    this._app = new App({ ...options, isHost: true })
  }

  static initialize(options: AppCtorOptions) {
    HostApp.__instance = new HostApp(options)
    return HostApp.__instance._app
  }

  /** 加载微应用 */
  // static loadMicroApp(options: AppCtorOptions) {
  //   const app = new App(options)
  //   return app
  // }

  /** 是否已初始化 */
  static get isInitialized() {
    return !!this.__instance
  }

  static get instance() {
    return HostApp.__instance
  }

  static get app() {
    return HostApp.__instance?._app
  }

  static get env() {
    return HostApp.app?.env
  }

  static get api() {
    return HostApp.app?.api
  }

  static get ui() {
    return HostApp.app?.ui
  }

  /**
   * @deprecated 请直接使用HostApp.env
   * @returns
   */
  static useEnv() {
    return HostApp.app?.useEnv()
  }

  static logout() {
    return HostApp.app?.logout()
  }

  static useConfig(path: string, defaultValue?: any) {
    return HostApp.app?.useConfig(path, defaultValue)
  }

  /**
   * @deprecated 直接使用 HostApp.api
   * @param name
   * @returns
   */
  static useApi(name?: string) {
    return HostApp.app?.useApi(name)
  }
}

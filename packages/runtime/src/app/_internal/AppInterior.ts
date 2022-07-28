import { App } from '../App'

import type { UserStore } from '../../typings'

/**
 * 应用内部类
 * 为避免App内部过于复杂，用于提供应用内部功能
 * 继承此类的类，一般用于将App部分对外功能进行集成
 */
export abstract class AppInterior<T extends AppInterior<T>> {
  readonly app: App
  readonly hostApp: App
  readonly userStore: UserStore

  protected constructor(app: App) {
    this.app = app
    this.hostApp = app.useHostApp()

    // 微应用不能创建自己的useStore，只能获取hostApp的store
    this.userStore = this.hostApp.stores.userStore
  }

  /**
   * 当前应用是否为独立的App，一般用于检测只在主应用中执行的方法
   * 如权限验证、token刷新等
   * 一般全局操作性方法需要进行验证
   */
  checkIndependent() {
    return this.app.isIndependent
  }
}

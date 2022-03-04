import { AppError, AppAuthError, AppLoadError, ErrorCodes } from '@zto/zpage-core'

import { warn } from '../utils'
import { setConfig } from '../config'
import { useAuthLoader } from './loaders'
import { createAppStore } from './store'
import { createAppRouter } from './router'
import { install } from './install'
import { getNormalizedOptions } from './options'
import { App } from './App'

import type { Router } from 'vue-router'
import type { AppOptions, VueApp } from '../typings'

/** 返回当前实例 */
export function useApp() {
  return App.instance
}

let __appError: AppError | undefined

/**
 * 创建应用
 * @param options 应用选项
 * @returns
 */
export async function startApp(options: AppOptions) {
  // 标准化配置
  const opts = getNormalizedOptions(options)

  const config = opts.config
  setConfig(config)

  // 创建store
  const store = createAppStore()

  // 创建router
  const router = createAppRouter(opts.ui.router)

  const runtimeApp = App.initialize({
    el: opts.el,
    schema: opts.schema,
    ui: opts.ui,
    store,
    router
  })

  const app = await runtimeApp.start()

  if (!app.vueApp) {
    warn('创建应用失败，请确认传入了正确的参数。')
    return
  }

  // 安装ui
  if (app.ui.install) await app.ui.install(app, options)

  try {
    const authLoader = useAuthLoader()
    if (authLoader) await authLoader.checkAuth(config)
  } catch (ex) {
    __appError = new AppAuthError(ex, '验证权限错误')
  }

  try {
    // 加载app初始化数据
    await store.dispatch('app/load', opts)

    // 安装应用(组件、微件、插件)
    await install(runtimeApp, opts)

    // 执行app加载
    const onLoad = config.app?.onLoad
    if (onLoad) await Promise.resolve().then(() => onLoad(runtimeApp, opts))

    // 设置应用加载成功
    store.commit('app/setAppLoaded')
  } catch (ex) {
    __appError = new AppLoadError(ex)
  }

  // 显示应用错误
  if (__appError) warn('应用启动错误', __appError)

  // 载入应用页面
  if (opts.el) await mountApp(opts.el)

  return runtimeApp
}

/**
 * 加载App
 * @param el 加载目标
 * @returns
 */
export async function mountApp(el: Element | string): Promise<VueApp> {
  const runtimeApp = App.instance

  const vueApp = runtimeApp?.vueApp

  if (!vueApp) throw new Error('请先通过setupApp再进行加载')

  const router = vueApp.config.globalProperties.$router as Router

  if (!router) throw new Error('请先出实例化应用路由')

  await router.isReady()

  vueApp.mount(el)

  // 缓存错误
  if (__appError) {
    const pathName = __appError.code === ErrorCodes.APP_AUTH_ERROR ? '403' : '500'

    await router.replace({
      name: pathName,
      params: {
        description: __appError.description,
        message: __appError.message
      }
    })

    __appError = undefined
  }

  return vueApp
}

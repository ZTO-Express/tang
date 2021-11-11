import { warn } from './utils'
import { setConfig } from './config'
import { getNormalizedOptions } from './options'
import { Runtime } from './runtime'
import { install } from './install'
import { useAuthLoader } from './loaders'
import { createAppStore } from './store'
import { createAppRouter } from './router'

import type { Router } from 'vue-router'
import type { AppOptions } from './typings'

/**
 * 创建应用
 * @param options 应用选项
 * @returns
 */
export const startApp = async (options: AppOptions) => {
  // 标准化配置
  const opts = getNormalizedOptions(options)

  const config = opts.config
  setConfig(Object.freeze(config))

  // 先检查认证
  const authLoader = useAuthLoader()
  if (authLoader) await authLoader.checkAuth(config)

  // 创建store
  const store = createAppStore()

  // 创建router
  const router = createAppRouter(opts.ui.router)

  const runtime = Runtime.createInstance({
    el: opts.el,
    schema: opts.schema,
    root: opts.ui.root,
    store,
    router
  })

  const { app } = runtime.start(config)

  if (!app) {
    warn('创建应用失败，请确认传入了正确的参数。')
    return
  }

  // 应用ui
  runtime.applyUI(opts.ui, opts)

  // 加载app初始化数据
  await runtime.store.dispatch('app/load', opts)

  // 4. 执行app加载
  const onLoad = config.app?.onLoad
  if (onLoad) {
    await Promise.resolve().then(() => onLoad(runtime, opts))
  }

  // 安装应用(组件、微件、插件)
  await install(runtime, opts)

  // 载入应用页面
  if (opts.el) {
    await mountApp(opts.el)
  }

  return { instance: runtime }
}

/**
 * 加载App
 * @param el 加载目标
 * @returns
 */
export const mountApp = async (el: Element | string) => {
  const runtime = Runtime.getInstance()

  const app = runtime?.app

  if (!app) {
    warn('请先通过setupApp再进行加载')
    return
  }

  const router = app.config.globalProperties.$router as Router

  if (!router) {
    warn('请先出实例化应用路由')
    return
  }

  await router.isReady()

  app.mount(el)

  return app
}

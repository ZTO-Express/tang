import { _ } from '../../../utils'
import { STORE_NAME } from '../../../consts'
import { App } from '../../App'
import { defineStore } from '../util'

import type { AppState, AppGetters, AppActions, Submodule, NavMenuItem } from '../../../typings'

export function defineAppStore(app: App) {
  const appName = app.name

  return defineStore<AppState, AppGetters, AppActions>(STORE_NAME.APP, {
    appName,

    state: () => {
      return {
        loaded: false,
        appId: '',
        allSubmodules: [],
        navMenu: {
          submodule: '',
          menus: [],
          current: '',
          collapsed: false
        },
        data: {},
        error: null
      }
    },

    getters: {
      submodule: state => _getSubmodule(state, state.navMenu.submodule),
      submodules: state => {
        const moduels = (state.allSubmodules || []).filter(it => !it.meta?.hidden)
        return moduels
      }
    },

    actions: {
      // 初始化应用信息
      init(payload) {
        this.appId = payload.appId || ''

        const submodules: Submodule[] = payload.submodules || []

        // 顶级菜单作为子模块
        submodules.forEach(it => (it.isSubmodule = true))

        this.allSubmodules = submodules

        // 设置默认子模块
        _setSubmodule(this, { name: payload.default })
      },

      // 设置应用信息
      set(payload: Record<string, any>) {
        if (!payload) return

        this.$patch(payload)
      },

      // 设置应用加载
      setLoaded(loaded: boolean = true) {
        this.loaded = loaded
      },

      // 设置导航菜单
      setNavMenu(payload: any) {
        _setSubmodule(this, payload)
      },

      // 设置app states
      setData(payload: Record<string, any>) {
        if (!payload) return

        this.$patch(state => {
          const pData = payload

          if (_.isObject(pData)) {
            const sData = { ...state.data }

            for (const key in pData) {
              sData[key] = pData[key]
            }
            state.data = sData
          }
        })
      },

      // 加载应用基本信息
      async load() {
        const { userStore } = app.stores

        // 1. 加载用户信息
        await userStore.load({ root: true })

        // 2. 设置应用信息
        const authLoader = app.useAuthLoader()

        if (authLoader) {
          let submodules: Submodule[] = []
          if (authLoader?.getMenuData) {
            submodules = (await authLoader.getMenuData(app)) as Submodule[]
          }

          this.init({ submodules })
        }
      },

      // 切换子模块
      async changeSubmodule(payload: any) {
        const router = app.router
        const { appStore } = app.stores

        const navMenu = this.navMenu

        // 若子模块与当前子模块相同，则不作任何操作
        if (payload.name === navMenu.submodule) return

        this.setNavMenu(payload)

        const submodule = appStore.submodule

        if (submodule?.meta?.hidden) return

        if (payload.to) {
          await router.goto(payload.to)
        } else if (submodule?.defaultMenu?.name) {
          await router.goto({ name: submodule.defaultMenu?.name })
        } else {
          await router.goHome()
        }
      }
    }
  })
}

// 设置档期的子模块
function _setSubmodule(state: AppState, payload: any) {
  const submodule: Submodule | undefined = _getSubmodule(state, payload?.name)

  const navMenu = {
    submodule: '',
    current: '',
    collapsed: false,
    menus: [] as NavMenuItem[]
  }

  if (submodule) {
    navMenu.submodule = submodule.name
    navMenu.menus = submodule.children || []
  }

  state.navMenu = navMenu
}

// 获取指定的子模块
function _getSubmodule(state: AppState, name?: string) {
  const submodules = (state.allSubmodules || []).filter(it => !it.meta?.hidden)

  let submodule: Submodule | undefined = submodules[0]
  if (name) submodule = submodules.find(it => it.name === name)

  return submodule
}

import 'pinia'

import { STORE_NAME } from '../consts'

import type { _GettersTree, Store } from 'pinia'
import type { AppContext, Submodule, NavMenuItem } from './app'
import type { App } from '../app'

/** pinia扩展 */
declare module 'pinia' {
  export interface PiniaCustomProperties {
    get app(): App // 应用实例
  }

  export interface DefineStoreOptionsBase<S, Store> {
    appName: string // 应用名称
  }
}

/** 设置数据 */
export interface SetDataOptions {
  type?: string
  path?: string
  data?: any
  [prop: string]: any
}

export interface AppStores {
  appStore: AppStore
  userStore: UserStore
  pagesStore: PagesStore
}

export interface AppDatas {
  app?: AppData
  user?: UserData
  page?: PageData
}

export interface AppData {
  appId: string
  [prop: string]: any
}

export interface UserData {
  userId: string // 用户id
  mobile: string // 用户手机号
  avatar: string // 用户头像
  username: string // 用户名
  nickname: string // 用户昵称
  [prop: string]: any
}

export interface PageData {
  [prop: string]: any
}

export type AppStore = Store<string, AppState, AppGetters, AppActions>

export interface AppState {
  loaded: boolean // 是否已加载
  appId: string // appId
  allSubmodules: Submodule[]
  navMenu: {
    submodule: string // 子模块编号
    menus: NavMenuItem[]
    current: string
    collapsed: boolean
  }
  error: Record<string, any> | null // 应用错误信息
  data: Record<string, any> // 应用数据
}

export interface AppGetters extends _GettersTree<AppState> {
  submodule: (state: AppState) => Submodule | undefined
  submodules: (state: AppState) => Submodule[]
}

export interface AppActions {
  set: (payload: Record<string, any>) => void
  setLoaded: (loaded: boolean) => void
  setNavMenu: (payload: any) => void
  setData: (payload: SetDataOptions) => void
  init: (payload: { appId?: string; default?: string; submodules?: Submodule[] }) => void
  load: (options?: Record<string, any>) => Promise<void>
  changeSubmodule: (payload: any) => Promise<void>
}

export type UserStore = Store<string, UserState, UserGetters, UserActions>

export interface UserState {
  logged: boolean // 是否已登录
  userId: string // 用户id
  mobile: string // 用户手机号
  avatar: string // 用户头像
  username: string // 用户名
  nickname: string // 用户昵称
  menus: any // 菜单数组
  roles: string[] // 用户角色
  permissions: string[] // 用户权限
  data: Record<string, any> // 用户扩展信息
}

export interface UserGetters extends _GettersTree<UserState> {}

export interface UserActions {
  set: (payload: Record<string, any>) => void
  setData: (payload: SetDataOptions) => void
  load: (payload: Record<string, any>) => Promise<void>
}

export type PagesStore = Store<string, PagesState, PagesGetters, PagesActions>

export interface PageInfo {
  submodule: string
  name: string
  key: string
  label?: string
  refererKey?: string
  closeable?: boolean
  query?: Record<string, any>
  meta?: Record<string, any>
  [prop: string]: any
}

export interface PageInfoData extends PageInfo {
  submodule?: string
  name?: string | symbol
}

export interface PagesState {
  current: string // 当前打开的页面，切换页面后展示
  defaults: PageInfo[] // 默认打开页面
  visited: PageInfo[] // 所有正在浏览的页面, 不包括默认打开页面
  datas: Record<string, Record<string, any>> // 维护页面数据
}

export interface PagesGetters extends _GettersTree<PagesState> {
  currentPage: (state: PagesState) => { key: string; data: Record<string, any> }
  navPages: (state: PagesState) => PageInfo[]
}

export interface PagesActions {
  setCurrent: (pageKey: string) => void
  setDefaults: (pages: PageInfo[]) => void
  addVisited: (page: PageInfo) => void
  addCurrentVisited: (payload: { route?: any; redirect?: boolean }) => Promise<void>
  removeVisited: (page: PageInfoData) => void
  removeVisitedOthers: (page: PageInfoData) => void
  removeCurrentVisited: (page: PageInfoData) => Promise<boolean>
  pruneVisited: (submodule: string) => void
  pruneCurrentVisited: (payload?: { submodule?: string; redirect?: boolean }) => void
  addTemp: (menu: NavMenuItem) => void
  removeTemp: (page: PageInfoData) => Promise<void>
  setPageData: (pageKey: string, payload: SetDataOptions) => void
  setCurrentPageData: (options: SetDataOptions) => void
}

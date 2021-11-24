import type { Store } from 'vuex'
import type { Submodule, NavMenuItem } from './app'

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
  [propName: string]: any
}

export interface AppState {
  loaded: boolean // 是否已加载
  appId: string // appId
  submodules: Submodule[]
  navMenu: {
    submodule: string // 子模块编号
    menus: NavMenuItem[]
    current: string
    collapsed: boolean
  }
  error: Record<string, any> | null // 应用错误信息
  [propName: string]: any
}

export interface PageInfo {
  submodule: string
  name: string
  key: string
  label?: string
  refererKey?: string
  closeable?: boolean
  query?: Record<string, any>
  meta?: Record<string, any>
  [propName: string]: any
}

export interface PagesState {
  datas: Record<string, any> // 维护页面数据
  current: string // 当前打开的页面，切换页面后展示
  defaults: PageInfo[] // 默认打开页面
  visited: PageInfo[] // 所有正在浏览的页面, 不包括默认打开页面
  [propName: string]: any
}

export interface RootState {
  user: UserState
  app: AppState
  pages: PagesState
}

export type AppStore = Store<RootState>

import {
  DEFAULT_CONATINER_EL,
  ROOT_ROUTE_NAME,
  DEFAULT_MENU_NAME,
  DEFAULT_PAGE_NAME,
  DEFAULT_PAGE_PATH
} from '../../consts'
import { _ } from '../../utils'
import { CAppLayout } from '../components' // WARNING: 不能通过路径直接导出，否则打包会有问题

import type { RouteRecordRaw } from 'vue-router'
import type { AppStartOptions, NavMenuItemConfig } from '../../typings'

/**
 * 返回应用内部默认配置
 * @returns
 */
export const getInnerStartOptions = (): Partial<AppStartOptions> => {
  return {
    container: DEFAULT_CONATINER_EL,
    env: { name: 'prod' },
    config: {
      app: {
        frame: {},
        menu: { showNav: false },
        page: { keepAlive: false }
      }
    },
    extensions: {
      widgets: [],
      components: []
    }
  }
}

export const defaultRoutes = (): RouteRecordRaw[] => [
  {
    name: ROOT_ROUTE_NAME,
    path: '/',
    component: CAppLayout,
    redirect: DEFAULT_PAGE_PATH,
    children: []
  }
]

export const defaultMenus = (): NavMenuItemConfig[] => [
  {
    name: DEFAULT_MENU_NAME,
    title: '默认',
    meta: {
      hidden: true
    },
    children: [
      {
        name: DEFAULT_PAGE_NAME,
        title: '首页',
        order: 0,
        icon: '',
        path: DEFAULT_PAGE_PATH,
        meta: {
          submodule: false,
          hidden: true,
          default: true,
          closeable: false
        }
      }
    ]
  }
]

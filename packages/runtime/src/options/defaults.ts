import { ROOT_ROUTE_NAME } from '../consts'
import CAppLayout from '../components/CAppLayout'

import type { RouteRecordRaw } from 'vue-router'
import type { AppOptions, NavMenuItemConfig } from '../typings'

/**
 * 返回应用默认配置
 * @returns
 */
export const defaultOptions = (): Partial<AppOptions> => {
  return {
    el: '#app',
    config: {
      env: {},
      app: {
        menu: {
          showNav: false
        }
      },
      apis: {},
      routes: []
    },
    extends: {
      widgets: [],
      componnets: []
    }
  }
}

export const defaultRoutes = (): RouteRecordRaw[] => [
  {
    name: ROOT_ROUTE_NAME,
    path: '/',
    component: CAppLayout,
    redirect: '/welcome',
    children: []
  }
]

export const defaultMenus = (): NavMenuItemConfig[] => [
  {
    name: 'default',
    title: '默认',
    meta: {
      hidden: true
    },
    children: [
      {
        name: 'welcome',
        title: '首页',
        order: 0,
        icon: '',
        path: '/welcome',
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

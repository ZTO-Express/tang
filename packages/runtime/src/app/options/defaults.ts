import {
  DEFAULT_MOUNT_EL,
  ROOT_ROUTE_NAME,
  DEFAULT_MENU_NAME,
  DEFAULT_PAGE_NAME,
  DEFAULT_PAGE_PATH
} from '../../consts'
import { _ } from '../../utils'
import CAppLayout from '../components/CAppLayout'

import type { RouteRecordRaw } from 'vue-router'
import type { AppOptions, NavMenuItemConfig, NormalizedAppOptions } from '../../typings'

/**
 * 对传入的选项进行规范化
 * @param config
 */
export function getNormalizedOptions(options?: AppOptions): NormalizedAppOptions {
  // 设置全局配置
  const opts = _.deepMerge(defaultOptions(), options)

  return opts
}

/**
 * 返回应用默认配置
 * @returns
 */
export const defaultOptions = (): Partial<AppOptions> => {
  return {
    el: DEFAULT_MOUNT_EL,
    config: {
      env: {},
      app: {
        frame: {},
        menu: {
          showNav: false
        },
        page: {
          keepAlive: false
        }
      },
      apis: {},
      routes: []
    },
    extends: {
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

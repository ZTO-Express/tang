import { ROOT_ROUTE_NAME } from 'zpage'
import AppLayout from '../components/app/AppLayout.vue'

import Page403 from '../views/errors/403.vue'
import Page404 from '../views/errors/404.vue'
import Page500 from '../views/errors/500.vue'

import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: ROOT_ROUTE_NAME,
    path: '/',
    component: AppLayout,
    redirect: '/welcome',
    children: []
  },
  {
    name: '403',
    path: '/403', // 无权限页面
    component: Page403
  },
  {
    name: '500',
    path: '/500', // 服务器错误
    component: Page500
  },
  {
    name: '404',
    path: '/:pathMatch(.*)*', // 404页面
    component: Page404
  }
]

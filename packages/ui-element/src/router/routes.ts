import { ROOT_ROUTE_NAME } from '@zto/zpage'

import AppLayout from '../components/app/AppLayout.vue'
import CErrorPage from '../components/page/CErrorPage.vue'

import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: ROOT_ROUTE_NAME,
    path: '/',
    component: AppLayout,
    redirect: '/operate/list',
    children: []
  },
  {
    name: '403',
    path: '/403', // 无权限页面
    component: CErrorPage
  },
  {
    name: '500',
    path: '/500', // 服务器错误
    component: CErrorPage
  },
  {
    name: '404',
    path: '/:pathMatch(.*)*', // 404页面
    component: CErrorPage
  }
]

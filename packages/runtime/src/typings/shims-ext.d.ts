/**
 * 相关全局或库类型扩展
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Router, RouteRecordNormalized, RouteLocationNormalizedLoaded } from 'vue-router'

export type Route = RouteLocationNormalizedLoaded

/** 扩展全局类型 */
declare global {
  const __DEV__: boolean
}

/** 扩展vue-router */
declare module 'vue-router' {
  interface Router {
    __cachedNodes: Record<string, VNode> // 已缓存节点
    goHome: () => Promise<void | NavigationFailure>
    goLogin: () => Promise<void | NavigationFailure>
    goBack: () => Promise<void | NavigationFailure>
    goto: (to: any) => Promise<void | NavigationFailure>
    close: (pageKey?: string) => Promise<void>
    getRouteByName: (name: string) => RouteRecordNormalized | undefined
    getRouteByPageKey: (key: string) => RouteRecordNormalized | undefined
    getRouteByMenuPath: (menuPath: string) => RouteRecordNormalized | undefined
    getCurrentPageKey: () => string | undefined
    pruneCurrentPage: () => void
  }
}

export {}

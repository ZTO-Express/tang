import type { PageSchema } from '@zpage/core'
import type { RouteRecordRaw } from 'vue-router'
import type {
  VueApp,
  VueComponent,
  Installable,
  InstallableOptions,
  RuntimeUI,
  RuntimeConfig,
  RendererOptions,
  AppOptions,
  AppUserApi,
  NavMenuItem,
  NavMenuItemConfig,
  AppRendererOptions
} from './typings'

export * as vue from 'vue'
export * as vuex from 'vuex'
export * as vueRouter from 'vue-router'

export type { RouteRecordRaw }
export type { VueApp, VueComponent }
export type {
  Installable,
  InstallableOptions,
  RuntimeUI,
  RuntimeConfig,
  RendererOptions,
  AppOptions,
  AppUserApi,
  NavMenuItem,
  NavMenuItemConfig,
  AppRendererOptions
}
export type { PageSchema }
export * from './consts'
export * from './utils'
export * from './config'
export * from './entry'

export * from './app'
export * from './renderer'

import type {
  GenericFunction,
  GenericObject,
  PromiseFunction,
  DateValue,
  PageSchema,
  Widget
} from '@zto/zpage-core'
import type { RouteRecordRaw } from 'vue-router'
import type { VueApp, VueComponent } from './typings'
import type {
  ApiRequestAction,
  ApiRequestConfig,
  ApiQueryRequestConfig,
  ApiRequest,
  ApiQueryRequest
} from './typings'
import type {
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

export type { GenericFunction, GenericObject, PromiseFunction, DateValue }
export type { RouteRecordRaw }
export type { VueApp, VueComponent }
export type {
  ApiRequestAction,
  ApiRequestConfig,
  ApiQueryRequestConfig,
  ApiRequest,
  ApiQueryRequest
}
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
export type { PageSchema, Widget }
export * from './consts'
export * from './utils'
export * from './config'
export * from './entry'

export * from './app'
export * from './renderer'

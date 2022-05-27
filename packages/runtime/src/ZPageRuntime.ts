import type {
  GenericFunction,
  GenericObject,
  PromiseFunction,
  DateValue,
  AppSchema,
  PartialAppSchema,
  PageSchema,
  PartialPageSchema,
  Widget,
  Loader,
  CmptAttrs,
  CmptAttrsMethod,
  CmptConfig
} from '@zto/zpage-core'
import type { RouteRecordRaw } from 'vue-router'
import type { VueApp, VueComponent } from './typings'
import type { ApiRequestAction, ApiRequestConfig, ApiQueryRequestConfig, ApiRequest, ApiQueryRequest } from './typings'

import type {
  RendererOptions,
  AppStartOptions,
  AppConfigOptions,
  AppContext,
  AppFsApi,
  AppAuthApi,
  NavMenuItem,
  NavMenuItemConfig,
  AppRendererOptions,
  AppLoader,
  AppPageLoader,
  AppAuthLoader,
  AppConfigDefinition,
  PageInfo,
  PageInfoData
} from './typings'

import type { DataOptionItem, DataOptionItems } from './typings'

export {
  Fragment,
  reactive,
  ref,
  unref,
  toRefs,
  shallowRef,
  computed,
  watch,
  watchEffect,
  markRaw,
  onBeforeMount,
  onMounted,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  useAttrs,
  useSlots,
  provide,
  inject,
  defineComponent,
  resolveComponent,
  getCurrentInstance,
  h
} from 'vue'

export { onBeforeRouteUpdate } from 'vue-router'

export * as vue from 'vue'
export * as vuex from 'vuex'
export * as vueRouter from 'vue-router'

export * from './typings/config.d'
export * from './typings/runtime.d'
export * from './typings/app.d'

export type { Ref, PropType } from 'vue'

export type { GenericFunction, GenericObject, PromiseFunction, DateValue }
export type { RouteRecordRaw }
export type { VueApp, VueComponent }
export type { ApiRequestAction, ApiRequestConfig, ApiQueryRequestConfig, ApiRequest, ApiQueryRequest }
export type {
  RendererOptions,
  AppStartOptions,
  AppConfigOptions,
  AppConfigDefinition,
  AppContext,
  AppFsApi,
  AppAuthApi,
  NavMenuItem,
  NavMenuItemConfig,
  AppRendererOptions,
  AppLoader,
  AppPageLoader,
  AppAuthLoader,
  PageInfo,
  PageInfoData
}
export type { DataOptionItem, DataOptionItems }
export type { PageSchema, PartialPageSchema, AppSchema, PartialAppSchema, Widget, Loader }
export type { CmptAttrs, CmptAttrsMethod, CmptConfig }

export * from './consts'
export * from './utils'
export * from './entry'

export * from './app'
export * from './renderer'

import AppRoot from './components/app/AppRoot.vue'
import AppTheme from './components/app/AppTheme.vue'
import * as AppRouter from './router'

import type { VueComponent } from '@zto/zpage'

export const name = 'ZPageElementUI'
export { install } from './install'
export const root = AppRoot as unknown as VueComponent
export const theme = AppTheme
export const router = AppRouter

export * from './composables'
export * from './utils'

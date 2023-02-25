import { AppRoot, AppTheme } from './components/app'
import * as AppRouter from './router'

import type { VueComponent } from '@zto/zpage'

export const name = 'ZPageElementUI'
export { install } from './install'
export const root = AppRoot as unknown as VueComponent
export const theme = AppTheme
export const router = AppRouter

export * from './consts'
export * from './composables'
export * from './utils'
export * from './components/form/util'

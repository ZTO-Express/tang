import AppRoot from './components/app/AppRoot.vue'
import AppTheme from './components/app/AppTheme.vue'
import * as AppRouter from './router'

export const name = 'ZPageElementUI'
export { install } from './install'
export const root = AppRoot
export const theme = AppTheme
export const router = AppRouter

export * from './composables'

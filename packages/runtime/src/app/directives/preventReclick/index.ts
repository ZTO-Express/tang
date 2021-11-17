import preventReClick from './preventReclick'
import type { App } from 'vue'

export const install = function (app: App) {
  app.directive('preventReclick', preventReClick)
}

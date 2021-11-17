import permission from './permission'
import type { App } from 'vue'

export const install = function (app: App) {
  app.directive('perm', permission)
}

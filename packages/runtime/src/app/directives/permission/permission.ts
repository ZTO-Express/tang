import { _ } from '../../../utils'
import { tryUseCurrentAppInstance } from '../../composables'

import type { Directive } from 'vue'

const permission: Directive = {
  mounted(el, binding) {
    const app = tryUseCurrentAppInstance()

    const { value } = binding

    if (!app || _.isNil(value)) return

    const roles: string[] = app.stores.userStore.permissions

    if (value && Array.isArray(value)) {
      // 截取空格以容错
      const permissionRoles = value.map(it => {
        if (typeof it === 'string') {
          return it.trim()
        }
        return it
      })
      const hasPermission = roles.some(role => {
        return permissionRoles.includes(role)
      })

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  }
}
export default permission

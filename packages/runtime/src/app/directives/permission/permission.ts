import { _ } from '../../../utils'
import { tryUseCurrentAppInstance } from '../../composables'

import type { App, Directive } from 'vue'

const permission = (vueApp: App): Directive => {
  return {
    mounted(el, binding) {
      const app = tryUseCurrentAppInstance(false, vueApp)

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
          // el.parentNode && el.parentNode.removeChild(el)
          // 没有此权限隐藏此元素
          el.style.display = 'none'
        }
      }
    }
  }
}

export default permission

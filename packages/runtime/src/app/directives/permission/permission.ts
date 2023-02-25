import { _ } from '../../../utils'
import { tryUseCurrentAppInstance } from '../../composables'

import type { App, Directive } from 'vue'

const permission = (vueApp: App): Directive => {
  return {
    mounted(el, binding) {
      const app = tryUseCurrentAppInstance(false, vueApp)

      const { value } = binding

      if (!app || _.isNil(value)) return

      let perms: string[] = app.stores.userStore.perms || []

      const currentModule = app.stores.appStore.submodule

      // 如果是单独模块，则权限验证加上模块前缀
      if (currentModule?.singleModule && perms.length) {
        perms = perms.map(p => `${currentModule.name}__${p}`)
      }

      if (value && Array.isArray(value)) {
        // 截取空格以容错
        const permissionRoles = value.map(it => {
          if (typeof it === 'string') {
            return it.trim()
          }
          return it
        })
        const hasPermission = perms.some(role => {
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

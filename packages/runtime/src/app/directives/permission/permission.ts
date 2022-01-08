import { _ } from '../../../utils'
import { useAppStore } from '../../store'
import type { Directive } from 'vue'

const permission: Directive = {
  mounted(el, binding) {
    const store = useAppStore()

    const { value } = binding

    if (_.isNil(value)) return

    const roles: string[] = store.getters.permissions

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

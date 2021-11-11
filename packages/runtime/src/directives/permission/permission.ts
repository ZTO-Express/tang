import { useStore } from '../../store'
import type { Directive } from 'vue'

const permission: Directive = {
  mounted(el, binding) {
    const store = useStore()

    const { value } = binding
    const roles: string[] = store.getters.permissions

    if (value && value instanceof Array && value.length > 0) {
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
    } else {
      throw new Error(`need roles! Like v-perm="['op_editor']"`)
    }
  }
}
export default permission

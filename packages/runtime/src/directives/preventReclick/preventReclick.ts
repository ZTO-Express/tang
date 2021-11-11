/*
用法：
v-preventReclick || 
v-preventReclick="2000"
*/

import type { Directive } from 'vue'

const preventReClick: Directive = {
  mounted(el: any, binding: any) {
    el.addEventListener('click', () => {
      if (!el.disabled) {
        el.disabled = true
        setTimeout(() => {
          el.disabled = false
        }, binding.value || 1000)
      }
    })
  }
}
export default preventReClick

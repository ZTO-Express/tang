/*
用法：
v-preventReclick || 
v-preventReclick="2000"
*/

import { _ } from '../../../utils'

import type { Directive } from 'vue'

const preventReClick: Directive = {
  mounted(el: any, binding: any) {
    const ins = binding.instance // 绑定实例
    const delay = binding.value || 1000 // 延时时间

    el.addEventListener('click', () => {
      if (ins?.setReclickDisabled) {
        if (!ins.reclickDisabled) ins.setReclickDisabled(true)
        setTimeout(() => ins.setReclickDisabled(false), delay)
      } else if (!el.disabled) {
        el.disabled = true
        setTimeout(() => (el.disabled = false), delay)
      }
    })
  }
}
export default preventReClick

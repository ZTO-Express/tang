import { defineComponent, h } from 'vue'

export default defineComponent({
  setup() {
    return () =>
      h('div', {
        class: 'c-micro'
      })
  }
})

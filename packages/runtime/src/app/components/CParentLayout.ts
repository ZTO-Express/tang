import { defineComponent, h } from 'vue'
import { RouterView } from 'vue-router'

export default defineComponent({
  setup() {
    return () => {
      h(RouterView)
    }
  }
})

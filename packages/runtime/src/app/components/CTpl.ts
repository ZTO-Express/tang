import { defineComponent } from 'vue'
import { useCurrentAppInstance } from '../composables'

export default defineComponent({
  props: {
    tpl: { type: [String, Object] },
    contextData: { type: Object }
  },

  setup(props: any) {
    const app = useCurrentAppInstance()

    return () => {
      if (!props.tpl) return ''
      const text = app.filter(props.tpl, props.contextData || {})
      return text
    }
  }
})

import { defineComponent } from 'vue'
import { tpl } from '../../utils'
import { useAppContext } from '../composables'

export default defineComponent({
  props: {
    tpl: { type: [String, Object] },
    contextData: { type: Object }
  },

  setup(props: any) {
    const context = useAppContext(props.contextData || {})

    return () => {
      if (!props.tpl) return ''
      const text = tpl.filter(props.tpl, context)
      return text
    }
  }
})

import { defineComponent } from 'vue'
import { renderHtml, tpl } from '../../utils'
import { useCurrentAppInstance } from '../composables'

export default defineComponent({
  props: {
    html: { type: [String, Object, Function] },
    contextData: { type: Object }
  },

  setup(props: any) {
    return () => {
      const app = useCurrentAppInstance()

      if (!props.html) return ''

      const context = app.useContext(props.contextData)
      return renderHtml(props.html, context)
    }
  }
})

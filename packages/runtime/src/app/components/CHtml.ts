import { defineComponent } from 'vue'
import { renderHtml, tpl } from '../../utils'
import { useCurrentAppInstance } from '../composables'

export default defineComponent({
  props: {
    html: { type: [String, Object] },
    contextData: { type: Object }
  },

  setup(props: any) {
    return () => {
      const app = useCurrentAppInstance()

      if (!props.html) return ''
      const html = app.deepFilter(props.html, props.contextData || {})
      return renderHtml(html)
    }
  }
})

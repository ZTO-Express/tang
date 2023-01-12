import { defineComponent } from 'vue'
import { renderHtml, tpl } from '../../utils'
import { useCurrentAppInstance } from '../composables'

export default defineComponent({
  props: {
    html: { type: [String, Object, Function] },
    ctxData: { type: Object }, // contextData有时会无法传递过来（可能与vue3命名冲突，这里兼容提供ctxData传递数据方式）
    contextData: { type: Object }
  },

  setup(props: any) {
    return () => {
      const app = useCurrentAppInstance()

      if (!props.html) return ''

      const context = app.useContext({ ...props.ctxData, ...props.contextData })
      return renderHtml(props.html, context)
    }
  }
})

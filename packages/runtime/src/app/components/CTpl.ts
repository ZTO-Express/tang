import { defineComponent } from 'vue'
import { useCurrentAppInstance } from '../composables'

export default defineComponent({
  props: {
    tpl: { type: [String, Object] },
    ctxData: { type: Object }, // contextData有时会无法传递过来（可能与vue3命名冲突，这里兼容提供ctxData传递数据方式）
    contextData: { type: Object }
  },

  setup(props: any) {
    const app = useCurrentAppInstance()

    return () => {
      if (!props.tpl) return ''
      const text = app.filter(props.tpl, { ...props.ctxData, ...props.contextData })
      return text
    }
  }
})

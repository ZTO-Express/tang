import { defineComponent } from 'vue'
import { useAppContext } from '../../composables'
import { tpl } from '../../utils'

export default defineComponent({
  props: {
    schema: { type: Object }
  },

  setup(props: any) {
    const context = useAppContext()

    return () => {
      const sTpl = props.schema.tpl
      if (!sTpl) return ''
      const text = tpl.filter(sTpl, context)
      return text
    }
  }
})

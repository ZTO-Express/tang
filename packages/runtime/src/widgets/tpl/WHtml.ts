import { defineComponent } from 'vue'
import { useAppContext } from '../../composables'
import { renderHtml, tpl } from '../../utils'

export default defineComponent({
  props: {
    schema: { type: Object }
  },

  setup(props: any) {
    const context = useAppContext()

    return () => {
      const sHtml = props.schema.html
      if (!sHtml) return ''
      const html = tpl.deepFilter(sHtml, context)
      return renderHtml(html)
    }
  }
})

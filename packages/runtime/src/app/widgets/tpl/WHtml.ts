import { defineComponent } from 'vue'
import { renderHtml, tpl } from '../../../utils'
import { useAppContext } from '../../composables'

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

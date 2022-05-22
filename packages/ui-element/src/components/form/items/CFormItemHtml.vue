<script lang="ts">
import { renderHtml, defineComponent, useCurrentAppInstance } from '@zto/zpage'

export default defineComponent({
  inheritAttrs: false,

  props: {
    model: { type: Object },
    prop: { type: String },
    html: { type: [String, Object], required: true }
  },

  setup(props: any) {
    const app = useCurrentAppInstance()
    const context = app.useContext(props.model)

    return () => {
      return renderHtml(props.html, context)
    }
  }
})
</script>

<script lang="ts">
import { vue, renderHtml, useAppContext } from '@zto/zpage'

const { defineComponent } = vue

export default defineComponent({
  inheritAttrs: false,

  props: {
    model: { type: Object },
    prop: { type: String },
    html: { type: [String, Object], required: true }
  },

  setup(props: any) {
    const context = useAppContext(props.model)

    return () => {
      return renderHtml(props.html, context)
    }
  }
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { renderHtml, useAppContext } from 'zpage'

export default defineComponent({
  inheritAttrs: false,

  props: {
    model: { type: Object, required: true },
    prop: { type: String, required: true },
    html: { type: String, required: true }
  },

  setup(props: any) {
    const context = useAppContext(props.model)

    return () => {
      return renderHtml(props.html, context)
    }
  }
})
</script>

import { defineComponent, h, ref, Teleport, watch } from 'vue'
import { usePageLoader } from '../loaders'
import { Widget } from '../../entry'

export default defineComponent({
  props: {
    pagePath: { type: String },
    pageSchema: { type: Object },
    teleportTo: { type: String }
  },

  async setup(props: any) {
    const pageLoader = usePageLoader()
    const innerSchema = ref<any>()

    watch(
      () => [props.pagePath, props.pageSchema],
      () => {
        resetPageSchema()
      }
    )

    async function resetPageSchema() {
      let pageSchema = props.pageSchema
      if (!pageSchema) {
        pageSchema = await pageLoader?.loadPage(props.pagePath as string)
      }

      if (!pageSchema) pageSchema = { type: 'blank' }
      pageSchema.type = pageSchema.type || 'page'

      innerSchema.value = pageSchema
    }

    await resetPageSchema()

    return () => {
      const innerWidget = h(Widget, {
        schema: innerSchema
      })

      debugger
      if (props.teleportTo) {
        return h(Teleport, { to: props.teleportTo }, innerWidget)
      } else {
        return innerWidget
      }
    }
  }
})

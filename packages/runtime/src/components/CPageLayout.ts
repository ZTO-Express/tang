import { defineComponent, h, ref, watch } from 'vue'
import { usePageLoader } from '../loaders'
import { Widget } from '../entry'

export default defineComponent({
  props: {
    pagePath: { type: String }
  },

  async setup(props: any) {
    const pageLoader = usePageLoader()
    const innerSchema = ref<any>()

    watch(
      () => props.pagePath,
      () => {
        resetPageSchema()
      }
    )

    async function resetPageSchema() {
      let pageSchema = await pageLoader?.loadPage(props.pagePath as string)
      if (!pageSchema) pageSchema = { type: 'blank' }
      pageSchema.type = pageSchema.type || 'page'

      innerSchema.value = pageSchema
    }

    await resetPageSchema()

    return () => {
      return h(Widget, {
        schema: innerSchema
      })
    }
  }
})

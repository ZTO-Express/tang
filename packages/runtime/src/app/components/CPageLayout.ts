import { defineComponent, h, ref, Teleport, watch } from 'vue'
import { Widget } from '../../entry'
import { useCurrentAppInstance } from '../composables'

import type { AppPageLoader } from '../../typings'

export default defineComponent({
  props: {
    pagePath: { type: String },
    pageSchema: { type: Object },
    teleportTo: { type: String }
  },

  async setup(props: any) {
    const app = useCurrentAppInstance()

    // 页面加载错误
    let error: any = null

    let pageLoader: AppPageLoader | undefined
    try {
      await app.micro.checkActiveApp(true)

      pageLoader = app.usePageLoader()
    } catch (err) {
      error = err

      console.error(err)
    }

    const innerSchema = ref<any>()

    watch(
      () => [props.pagePath, props.pageSchema],
      () => {
        resetPageSchema()
      }
    )

    async function resetPageSchema() {
      let pageSchema = props.pageSchema

      if (!error && !pageSchema && pageLoader) {
        try {
          pageSchema = await pageLoader.loadPage(app, props.pagePath as string)
        } catch (err) {
          error = err
        }
      }

      if (!pageSchema) pageSchema = { type: 'blank', error }

      pageSchema.type = pageSchema.type || 'page'

      innerSchema.value = pageSchema
    }

    await resetPageSchema()

    return () => {
      const innerWidget = h(Widget, { schema: innerSchema.value })

      if (props.teleportTo) {
        return h(Teleport, { to: props.teleportTo }, innerWidget)
      } else {
        return innerWidget
      }
    }
  }
})

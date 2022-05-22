import { defineComponent, h, onBeforeMount, onUnmounted } from 'vue'

import { _ } from '../../utils'
import { useCurrentAppInstance } from '../composables'

export default defineComponent({
  props: {
    init: { type: [Object, Function] },
    meta: { type: Object }
  },

  setup(props, { slots }) {
    const app = useCurrentAppInstance()
    const { pagesStore } = app.stores

    onBeforeMount(async () => {
      let data: any = {}

      const initProp = props.init as any

      try {
        // 初始化数据
        if (_.isFunction(initProp)) {
          data = await initProp(app, props.meta)
        } else if (initProp?.data) {
          if (_.isFunction(initProp?.data)) {
            data = await initProp?.data(app, props.meta)
          } else {
            data = initProp.data
          }
        } else if (initProp?.api) {
          data = await app.request(initProp.api)
        }
      } catch (err) {}

      // 加载时初始化页面数据
      await pagesStore.setCurrentPageData({ type: 'init', data })
    })

    onUnmounted(async () => {
      // 卸载时清理页面数据
      await pagesStore.setCurrentPageData({ type: 'clear' })
    })

    return () => {
      return h('div', slots.default?.())
    }
  }
})

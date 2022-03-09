/* eslint-disable indent */
import { defineComponent, resolveComponent, h } from 'vue'

export default defineComponent({
  name: 'WRendererPage2',
  setup() {
    const CPage = resolveComponent('c-page')

    return () =>
      h(
        CPage,
        {
          class: 'w-renderer-page2',
          fixed: false
        },
        [h('div', { class: 'w-renderer-page__body' }, ['test'])]
      )
  }
})

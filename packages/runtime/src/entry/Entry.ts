import { h } from 'vue'

import { Widget } from './Widget'

export const Entry = {
  components: { Widget },

  props: {
    schema: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props: any) {
    const { schema } = props

    return () => {
      return h(
        'div',
        {
          class: {
            'w-entry': true
          }
        },
        h(Widget, { schema })
      )
    }
  }
}

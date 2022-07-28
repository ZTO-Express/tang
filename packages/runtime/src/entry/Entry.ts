import { h, defineComponent } from 'vue'

import { Widget } from './Widget'

export const Entry = defineComponent({
  name: 'Entry',

  components: { Widget },

  props: {
    schema: { type: Object, default: () => ({}) }
  },

  setup(props: any) {
    return () => {
      return h('div', { class: { 'w-entry': true } }, h(Widget, { schema: props.schema }))
    }
  }
})

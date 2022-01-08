import { h, defineComponent } from 'vue'

import { _ } from '../../../utils'
import { CHtml } from '../../components'

export default defineComponent({
  props: {
    schema: { type: Object }
  },

  setup(props: any) {
    return () => {
      const htmlProps = _.omit(props.schema, ['type'])
      return h(CHtml, { ...htmlProps })
    }
  }
})

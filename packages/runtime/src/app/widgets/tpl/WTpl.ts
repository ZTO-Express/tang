import { h, defineComponent } from 'vue'

import { _ } from '../../../utils'
import { CTpl } from '../../components'

export default defineComponent({
  props: {
    schema: { type: Object }
  },

  setup(props: any) {
    return () => {
      const tplProps = _.omit(props.schema, ['type'])
      return h(CTpl, { ...tplProps })
    }
  }
})

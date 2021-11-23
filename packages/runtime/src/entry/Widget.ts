import { h, ref, resolveComponent, defineComponent } from 'vue'
import type { VNode } from 'vue'

export const Widget = defineComponent({
  name: 'Widget',

  props: {
    schema: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props: any) {
    const schema = ref(props.schema)

    // 获取widget组件
    function resolveWidget(type: string) {
      let wType = type
      if (type && !type.startsWith('w-')) {
        wType = `w-${type}`
      }
      const c = resolveComponent(wType)
      return c
    }

    // 渲染多个widgets
    function renderWidgets(ss: any[]): VNode | VNode[] {
      if (Array.isArray(ss)) {
        const ws = ss.map((s) => {
          return renderWidget(s)
        })
        return ws
      }

      return renderWidget(ss)
    }

    // 渲染widget
    function renderWidget(s: any): VNode {
      if (typeof s === 'string') {
        s = {
          type: 'html',
          html: s
        }
      }

      const w = resolveWidget(s.type)

      // 执行递归
      let bodyChild: any = null
      if (s.body) {
        bodyChild = renderWidgets(s.body)
      }

      const childKeys = Object.keys(s).filter((key) => {
        return s[key] && s[key].type && typeof s[key].type === 'string'
      })

      const children = childKeys.reduce((target, key) => {
        target[key] = () => renderWidgets(s[key])
        return target
      }, {} as any)

      return h(
        w,
        { schema: s },
        {
          default: () => bodyChild,
          ...children
        }
      )
    }

    return () => renderWidgets(schema.value)
  }
})

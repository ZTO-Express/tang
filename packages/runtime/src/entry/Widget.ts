import { h, computed, resolveComponent, defineComponent } from 'vue'

import { _ } from '../utils'
import { useCurrentAppInstance } from '../app'
import { isAppUseMethod, _useAppConfig } from '../app/config/use-config'
import { Cmpt } from './Cmpt'

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
    const app = useCurrentAppInstance()

    const schema = computed(() => props.schema?.value || props.schema)

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
        const ws = ss.map(s => {
          return renderWidget(s)
        })
        return ws
      }

      return renderWidget(ss)
    }

    // 渲染组件
    function renderCmpt(c: any) {
      let cfg = c

      if (c.ctype) {
        cfg = _.omit(c, ['ctype'])
        cfg.type = c.ctype
      } else if (c.cmpt) {
        cfg = c.cmpt
      }

      return h(Cmpt, { config: cfg })
    }

    // 渲染widget
    function renderWidget(s: any): VNode {
      if (isAppUseMethod(s)) {
        s = _useAppConfig(app, s)
      }

      if (s.ctype || s.cmpt) {
        return renderCmpt(s)
      }

      if (typeof s === 'string') {
        s = { type: 'html', html: s }
      }

      const w = resolveWidget(s.type)

      // 执行递归
      let bodyChild: any = null
      if (s.body) {
        bodyChild = renderWidgets(s.body)
      }

      const childKeys = Object.keys(s).filter(key => {
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

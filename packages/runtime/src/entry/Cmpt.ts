import { h, ref, useAttrs, defineComponent, resolveComponent, resolveDynamicComponent } from 'vue'
import { _ } from '../utils'
import { useCurrentAppInstance } from '../app'
import { isAppUseMethod, _useAppConfig } from '../app/config/use-config'

import type { VNode, ConcreteComponent } from 'vue'

export const Cmpt = defineComponent({
  name: 'Cmpt',

  props: {
    type: { type: String },
    config: { type: [Object, Function, String] },
    contextData: { type: Object }
  },

  setup(props: any, { expose }) {
    const app = useCurrentAppInstance()

    const cmptConfig = app.useComponentsConfig('cmpt')
    const cmptPrefixs: string[] = ['c-', ...(cmptConfig.prefixs || [])]

    const attrs = useAttrs()
    const contextData = props.contextData
    const context = app.useContext(contextData)

    // 获取组件属性，包括type
    function resolveCmptConfig(cfg: any) {
      if (!cfg) return cfg

      let cCfg: any = { ...cfg }

      if (_.isFunction(cfg)) {
        cCfg = cfg(context)
      } else if (_.isString(cfg)) {
        cCfg = { type: cfg }
      }

      let cCfgConfig: any = {}
      if (_.isFunction(cCfg.config)) {
        cCfgConfig = cCfg.config(context)
      } else if (_.isString(cCfg.config)) {
        cCfgConfig = { type: cCfg.config }
      } else if (_.isObject(cCfg.config)) {
        cCfgConfig = { ...cCfg.config }
      }

      cCfg = { ..._.omit(cCfg, ['config']), ...cCfgConfig }

      if (!cCfg.type && !cCfg.tag) cCfg.type = cCfg.tpl ? 'c-tpl' : 'c-html'

      return cCfg
    }

    // 获取组件
    function resolveCmpt(type: string): ConcreteComponent | string {
      let cType = type || 'c-html'

      let c: ConcreteComponent | string = cType

      // 前缀查找
      for (let it of cmptPrefixs) {
        if (cType.startsWith(it)) {
          // c = resolveDynamicComponent(cType)
          c = resolveComponent(cType)
          if (!_.isString(c)) break
        }
      }

      // 找到组件则直接返回
      if (!_.isString(c)) return c

      // 未找到组件，则尝试添加前缀并查找
      for (let it of cmptPrefixs) {
        // c = resolveDynamicComponent(`${it}${cType}`)
        c = resolveComponent(`${it}${cType}`)
        if (!_.isString(c)) break
      }

      // 找到组件则直接返回
      if (!_.isString(c)) return c

      // 若未找到组件，则返回原类型
      return type
    }

    // 渲染多个widgets
    function renderCmpts(cfgs: any | any[]): VNode | VNode[] {
      if (Array.isArray(cfgs)) {
        const cs = cfgs.map(cfg => renderCmpt(cfg))
        return cs
      }

      return renderCmpt(cfgs)
    }

    // 渲染widget
    function renderCmpt(cfg: any): VNode {
      if (isAppUseMethod(cfg)) {
        cfg = _useAppConfig(app, cfg)
      }

      const cCfg = resolveCmptConfig(cfg)

      let c: ConcreteComponent | string = ''

      if (cCfg.tag && !cCfg.type) {
        c = cCfg.tag
      } else {
        c = resolveCmpt(cCfg.type)
      }

      // 执行递归
      let slots: any = {}

      let childrenSlot: any = null

      let children = cCfg.children
      if (children) {
        childrenSlot = renderCmpts(children)
      } else if (cCfg.slot) {
        childrenSlot = {
          default: () => renderCmpts(cCfg.slot)
        }
      }

      const cAttrs = _.omit(cCfg, ['type'])

      let vn: VNode

      if (_.isString(c)) {
        vn = h(c, { contextData, ...cAttrs }, childrenSlot)
      } else {
        if (cCfg.slots) {
          if (!Array.isArray(cCfg.slots)) {
            throw 'slots 属性必须为数组'
          }

          Object.keys(cCfg.slots).forEach(key => {
            slots[key] = () => renderCmpts(cCfg.slots[key])
          })
        }

        vn = h(c, { contextData, ...cAttrs }, { ...childrenSlot, ...slots })
      }

      return vn
    }

    return () => {
      const innerCmpt = ref<any>(null)

      const cmptAttrs = { ref: innerCmpt, ...props, ...attrs }
      const vnode = renderCmpt(cmptAttrs)

      expose({ innerCmpt: innerCmpt || cmptAttrs.ref })

      return vnode
    }
  }
})

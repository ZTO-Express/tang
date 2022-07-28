import { h, useAttrs, defineComponent } from 'vue'
import { renderCmpt, _ } from '../utils'
import { useCurrentAppInstance } from '../app'

import { CTpl, CHtml } from '../app/components'
import { Cmpt } from './Cmpt'

import type { App } from '../app'

/** 内容组件自动检测传入属性并根据传入属性特点确定渲染方式 */
export const Content = defineComponent({
  name: 'Content', // 内容组件

  props: {
    // 属性根据判的优先级排列
    ctype: { type: String },
    cmpt: { type: [Object, Function, String] },
    component: { type: String },
    tpl: { type: [String, Object] },
    html: { type: String },
    type: { type: String },
    text: { type: String },
    content: { type: [String, Object, Function] },
    contextData: { type: Object }
  },

  setup(props: any) {
    const attrs = useAttrs()
    const app = useCurrentAppInstance()

    const allAttrs = { ...attrs, ...props }

    return () => {
      if (props.ctype || props.cmpt) return _renderCmpt(app, allAttrs)
      if (props.component) return _renderComponent(app, allAttrs)
      if (!_.isNil(props.tpl)) return _renderTpl(app, allAttrs)
      if (!_.isNil(props.html)) return _renderHtml(app, allAttrs)
      if (props.type) return _renderComponent(app, allAttrs)
      if (props.content) return _renderContent(app, allAttrs)
      return h('span', {}, props.text || '--')
    }
  }
})

/** 渲染模版 */
function _renderTpl(app: App, allAttrs: any) {
  return h(CTpl, { tpl: allAttrs.tpl, contextData: allAttrs.contextData })
}

/** 渲染Html */
function _renderHtml(app: App, allAttrs: any) {
  return h(CHtml, { html: allAttrs.html, contextData: allAttrs.contextData })
}

/** 渲染Cmpt */
function _renderCmpt(app: App, allAttrs: any) {
  let config: any = {}
  let type: string | undefined = undefined
  if (allAttrs.ctype) {
    type = allAttrs.ctype
    config = { ...allAttrs.config }
  } else {
    config = allAttrs.cmpt
  }

  return h(Cmpt, { type, config, contextData: allAttrs.contextData })
}

/** 渲染组件 */
function _renderComponent(app: App, allAttrs: any) {
  const context = app.useContext(allAttrs.contextData)

  let config: any = {}

  if (_.isFunction(allAttrs.component)) {
    config = allAttrs.component(context, allAttrs)
  } else {
    config = { ...allAttrs.component }
  }

  config.type = config.type || allAttrs.type

  return renderCmpt({ props: config, componentType: config.type }, context)
}

/** 渲染内容组件 */
function _renderContent(app: App, allAttrs: any) {
  let content = allAttrs.content
  if (_.isString(content)) {
    content = { tpl: content }
  } else if (_.isFunction(content)) {
    const context = app.useContext(allAttrs.contextData)
    content = allAttrs.content(context, allAttrs)
  }

  // 情控content属性，防止死循环
  return h(Content, { ...allAttrs, ...content, content: undefined })
}

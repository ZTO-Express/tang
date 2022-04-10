import { h, resolveComponent } from 'vue'
import { _ } from '../utils'
import * as tpl from './tpl'

import type { VNode } from 'vue'

/** 渲染html */
export function renderHtml(options: any, context: any = {}): VNode | string | undefined {
  if (options && typeof options === 'string') return tpl.filter(options, context)

  if (!options) return undefined
  if (options?.visibleOn && !tpl.evalExpression(options?.visibleOn, context)) return undefined

  // 渲染组件
  if (!options.tag && options.type) return renderCmpt(options, context)

  const props = tpl.deepFilter(options.props, context)
  const children = (options.children || []).map((it: any) => {
    return renderHtml(it, context)
  })

  return h(options.tag, props, children)
}

/** 渲染组件 */
export function renderCmpt(options: any, context: any = {}): VNode | string | undefined {
  if (options && typeof options === 'string') return tpl.filter(options, context)
  if (!options) return undefined

  if (_.isFunction(options)) options = options(context)
  if (options.visibleOn && !tpl.evalExpression(options?.visibleOn, context)) return undefined

  // 渲染html
  if (!options.type && options.tag) return renderHtml(options, context)

  const cmpt = resolveComponent(options.componentType || options.ctype || options.type)
  if (!cmpt) return undefined

  const props = tpl.deepFilter(options.props, context)
  const children: any = {}
  if (options.children) {
    children.default = () => {
      return (options.children || []).map((it: any) => {
        return renderCmpt(it, context)
      })
    }
  }

  if (options.slots) {
    Object.keys(options.slots).forEach(key => {
      const slot = options.slots[key]

      children[key] = () => {
        if (!slot) return undefined
        if (Array.isArray(slot)) {
          return slot.map(it => renderCmpt(it, context))
        } else {
          return renderCmpt(it, context)
        }
      }
    })
  }

  return h(cmpt, props, children)
}

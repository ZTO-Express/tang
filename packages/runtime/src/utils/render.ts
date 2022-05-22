import { h, resolveComponent } from 'vue'
import { _ } from '../utils'
import * as tpl from './tpl'

import type { VNode } from 'vue'

/** 渲染html */
export function renderHtml(options: any, dataContext: any = {}): VNode | string | undefined {
  if (options && typeof options === 'string') return tpl.filter(options, dataContext)

  if (!options) return undefined
  if (options?.visibleOn && !tpl.evalExpression(options?.visibleOn, dataContext)) return undefined

  // 渲染组件
  if (!options.tag && options.type) return renderCmpt(options, dataContext)

  const props = tpl.deepFilter(options.props, dataContext)

  let childrenOpt = options.children
  if (options.children && !Array.isArray(options.children)) {
    childrenOpt = [options.children]
  }
  const children = childrenOpt.map((it: any) => {
    return renderHtml(it, dataContext)
  })

  const tag = options.tag || 'div'
  return h(tag, props, children)
}

/** 渲染组件 */
export function renderCmpt(options: any, dataContext: any = {}): VNode | string | undefined {
  if (options && typeof options === 'string') return tpl.filter(options, dataContext)
  if (!options) return undefined

  if (_.isFunction(options)) options = options(dataContext)
  if (options.visibleOn && !tpl.evalExpression(options?.visibleOn, dataContext)) return undefined

  // 渲染html
  if (!options.type && options.tag) return renderHtml(options, dataContext)

  const cmpt = resolveComponent(options.componentType || options.ctype || options.type)
  if (!cmpt) return undefined

  const props = tpl.deepFilter(options.props, dataContext)
  const children: any = {}
  if (options.children) {
    children.default = () => {
      return (options.children || []).map((it: any) => {
        return renderCmpt(it, dataContext)
      })
    }
  }

  if (options.slots) {
    Object.keys(options.slots).forEach(key => {
      const slot = options.slots[key]

      children[key] = () => {
        if (!slot) return undefined
        if (Array.isArray(slot)) {
          return slot.map(it => renderCmpt(it, dataContext))
        } else {
          return renderCmpt(it, dataContext)
        }
      }
    })
  }

  return h(cmpt, props, children)
}

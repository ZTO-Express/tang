import { warn } from './debug'

/**
 * 重新加载页面
 * @param url
 */
export function reloadUrl(url?: string) {
  url = url || window.location.origin + window.location.hash
  window.location.href = url
}

/**
 * 获取dom元素
 * @param el
 * @returns
 */
export function queryEl(el: string | Element): Element {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      warn(`Cannot find element: ${el}`)
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}

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
export function queryEl(el?: string | Element): Element | undefined {
  if (!el) return undefined

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

/** 设置文档标题 */
export function setDocTitle(title: string) {
  document.title = title
}

/** 设置剪切板内容 */
export function setClipboardText(v: string) {
  const aux = document.createElement('textarea')
  aux.setAttribute('value', v) // 设置元素内容
  document.body.appendChild(aux) // 将元素插入页面进行调用
  aux.select() // 复制内容
  document.execCommand('copy') // 将内容复制到剪贴板
  document.body.removeChild(aux) // 删除创建元素
}

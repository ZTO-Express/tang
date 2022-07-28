import { warn } from './debug'
import { uuid } from './helper'

/**
 * 重新加载页面
 * @param url
 */
export function reloadUrl(url?: string) {
  return new Promise(resolve => {
    url = url || window.location.origin + window.location.hash
    window.location.href = url

    setTimeout(() => resolve(true), 200)
  })
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

/** 动态加载脚本 */
export function loadScript(src: string) {
  return new Promise<void>((ok, fail) => {
    const script = document.createElement('script')
    script.onerror = reason => fail(reason)

    if (~src.indexOf('{{callback}}')) {
      const callbackFn = `loadscriptcallback_${uuid()}`
      ;(window as any)[callbackFn] = () => {
        ok()
        delete (window as any)[callbackFn]
      }
      src = src.replace('{{callback}}', callbackFn)
    } else {
      script.onload = () => ok()
    }

    script.src = src
    document.head.appendChild(script)
  })
}

/** 加载样式表 */
export function loadCss(src: string) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.href = src
  const head = document.getElementsByTagName('head')[0]
  head.appendChild(link)
}

/** 加载样式文本 */
export function loadCssString(css: string) {
  const style = document.createElement('style')
  style.type = 'text/css'
  try {
    style.appendChild(document.createTextNode(css))
  } catch (ex) {
    style.textContent = css
  }
  var head = document.getElementsByTagName('head')[0]
  head.appendChild(style)
}

/**
 * 获取浏览器滚动条宽度 https://stackoverflow.com/a/13382873
 */
let __scrollbarWidth: number
export function getScrollbarWidth() {
  if (typeof __scrollbarWidth !== 'undefined') return __scrollbarWidth
  // Creating invisible container
  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.overflow = 'scroll' // forcing scrollbar to appear
  // @ts-ignore
  outer.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps
  document.body.appendChild(outer)

  // Creating inner element and placing it in the container
  const inner = document.createElement('div')
  outer.appendChild(inner)

  // Calculating difference between container's full width and the child width
  __scrollbarWidth = outer.offsetWidth - inner.offsetWidth

  // Removing temporary elements from the DOM
  if (outer.parentNode) outer.parentNode.removeChild(outer)

  return __scrollbarWidth
}

/** 文档头 */
export interface DocHeader {
  level: number
  anchor: string
  title: string
  [prop: string]: any
}

/** 解析文档headers */
export function resolveDocHeaders(el: Element): DocHeader[] {
  const headers: DocHeader[] = []

  const items = el.querySelectorAll('h1, h2, h3, h4, h5, h6')
  for (const h of items) {
    const anchor = h.getAttribute('id') || ''
    const title = h.textContent || anchor
    const level = parseInt(h.tagName.substring(1))

    headers.push({ anchor, title, level })
  }

  return headers
}

/** 跳转到指定定位点 */
export function gotoAnchor(anchorId: string) {
  const pageBodyEl = document.querySelector('.page-body-con') as any

  const anchorEl = document.getElementById(anchorId) as any

  if (anchorEl && pageBodyEl) {
    scrollTo(pageBodyEl, anchorEl.offsetTop)
  }
}

/* root: 根元素， y:目标纵坐标,duration:时间(毫秒) */
export function scrollTo(root: Element, y: number, duration: number = 500) {
  const scrollTop = root.scrollTop /* 页面当前滚动距离 */
  const distance = y - scrollTop /* 结果大于0,说明目标在下方,小于0,说明目标在上方 */
  const scrollCount = duration / 50 /* 50毫秒滚动一次,计算滚动次数 */
  const everyDistance = parseInt(String(distance / scrollCount)) /* 滚动距离除以滚动次数计算每次滚动距离 */

  /* 循环设置scrollBy事件,在duration之内,完成滚动效果 */
  for (let index = 1; index <= scrollCount; index++) {
    setTimeout(() => {
      root.scrollBy(0, everyDistance)
    }, 10 * index)
  }

  setTimeout(() => {
    root.scrollTo(0, y)
  }, 10 * (scrollCount + 1))
}

/**
 * Widget
 * @param section
 * @returns
 */
export function useWidgetProps() {
  return {
    schema: {
      type: Object,
      required: true
    }
  }
}

/** 当前key是否Widget事件key */
export function isWidgetEventKey(key: string) {
  return typeof key === 'string' && key.endsWith('On') && key !== 'On'
}

/** 页面事件名 */
export function isPageEventType(type: string) {
  return typeof type === 'string' && type.startsWith('$page_')
}

/** 页面事件 */
export function normalizeEventTypes(types: string[] | string, currentPageKey: string) {
  if (!Array.isArray(types)) types = [types]

  const _types = types.map(t => {
    if (isPageEventType(t)) return `${t}__${currentPageKey}`
    return t
  })

  return _types
}

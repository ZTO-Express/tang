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

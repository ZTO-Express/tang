import _ from 'lodash'
import { AppEventListener } from '../../typings'

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
export function normalizeEventTypes(types: AppEventListener | undefined, currentPageKey: string) {
  if (!types) return []

  let eventTypes: string[] = []

  if (_.isString(types)) {
    eventTypes = [types]
  } else if (Array.isArray(types)) {
    eventTypes = [...types]
  } else if (Array.isArray(types.events)) {
    eventTypes = [...types.events]
  }

  eventTypes = eventTypes.map(t => {
    if (isPageEventType(t)) return `${t}__${currentPageKey}`
    return t
  })

  return eventTypes
}

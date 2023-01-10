import { PAGE_SEARCH_EVENT_KEY } from '@zto/zpage'

/** 全局事件 */
export const UI_GLOBAL_EVENTS = Object.freeze({
  OPEN_DOWNLOADS: '$global_open_downloads',
  PAGE_TAB_CHANGE: '$global_page_tab_change'
})

/** 页面事件 */
export const UI_PAGE_EVENTS = Object.freeze({
  ACTIVATED: '$page_activated',
  MOUNTED: '$page_mounted',
  SEARCH: PAGE_SEARCH_EVENT_KEY
})

// 表格FormKey
export const C_FORM_KEY = Symbol('cForm')

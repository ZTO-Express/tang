export const TOKEN_DATA_STORAGE_KEY = 'token' // token数据存储key
export const TOKEN_REFRESH_DURATION = 120 // 每120秒刷新一次token

export const ROOT_ROUTE_NAME = 'root' // 根路由名称
export const ROOT_MENU_PREFIX = 'root:' // 根路由名称

export const DEFAULT_MOUNT_EL = '#app' // 默认菜单名

export const DEFAULT_MENU_NAME = 'default' // 默认菜单名
export const DEFAULT_PAGE_NAME = 'welcome' // 默认页名
export const DEFAULT_PAGE_PATH = `/${DEFAULT_PAGE_NAME}` // 默认页名

export const MICRO_CONTAINER_SUB_MODULE_DOM_ID = 'zpageMicroAppSubModuleContainer' // 微前端容器子模块id
export const MICRO_CONTAINER_PAGE_DOM_ID = 'zpageMicroAppPageContainer' // 微前端容器页面id

// 全局事件运行时
export const RUNTIME_GLOBAL_EVENTS = Object.freeze({
  CLOSE_APP_NAV: 'CLOSE_APP_NAV' // 关闭应用菜单
})

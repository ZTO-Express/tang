export const HOST_APP_TITLE = 'ZPage站点'

export const IAM_URL = 'https://iam.zto.com'
export const IAM_TEST_URL = 'http://iam.test.ztosys.com'

export const FS_URL = 'https://fs.zto.com'
export const FS_TEST_URL = 'https://fs.test.ztosys.com'

/** 全局事件 */
export const GLOBAL_EVENTS = Object.freeze({
  CURRENT_APP_CHANGE: '$app_change',
  ANALYSIS_DATE_RANGE_CHANGE: '$analysis_date_range_change'
})

export const HTTP_STATUS_CODES = Object.freeze({
  EMPTY_PARAM: 'S208', // 没有传必须参数
  IAM_TOKEN_EXPIRED: 'S217', // IAM Token过期
  SSO_TOKEN_EXPIRED: 'S205', // SSO Token过期
  JWT_TOKEN_INVALID: 'S209', // JWT Token无效
  SSO_ERROR: 'S218', // SSO系统错误
  INVALID_CODE: 'invalid_code', // 无效code
  USER_DISABLED: 'user_disabled' // 用户被禁用
})

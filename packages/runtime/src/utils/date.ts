import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

import type { OpUnitType, QUnitType } from 'dayjs'
import type { DateValue } from '@zto/zpage-core'

type DateFormatType = 'date' | 'full' | 'normal' | 'simple' | 'normal_simple'

const MILLISECONDS_IN_DAY = 86400000

/**
 * 格式化日期
 * @param dateVal 日期值（日期/数字/字符串类型）
 * @param template  日期格式
 */
export function format(dateVal?: DateValue, template?: DateFormatType | string): string {
  template = template || 'full'

  // 简单格式化
  if (template === 'simple' || template === 'full_simple') {
    return simpleFormat(dateVal, template === 'full_simple')
  }

  if (template === 'date') {
    template = 'YYYY-MM-DD'
  } else if (template === 'normal') {
    template = 'YYYY-MM-DD HH:mm'
  } else if (template === 'full' || template === 'datetime') {
    template = 'YYYY-MM-DD HH:mm:ss'
  }

  const dateStr = dayjs(dateVal).format(template)
  return dateStr
}

/**
 * 获取日期简单格式
 * @param dateVal 日期值
 * @param withTime
 * @returns
 */
export function simpleFormat(dateVal?: DateValue, withTime?: boolean): string {
  if (dateVal === undefined) {
    return ''
  }

  const d = new Date(dateVal)
  if (!d) return ''

  const nowDate = +new Date() // 当前日期数值
  // 日期差距，Math.floor是为了防止神秘的javascript计算问题
  const dateDiff = Math.floor((nowDate - d.valueOf()) / MILLISECONDS_IN_DAY)

  if (withTime === undefined && dateDiff < 3) {
    withTime = true
  }

  let t = 'YYYY年MM月DD日'
  if (withTime) {
    t = 'YYYY年MM月DD日 HH时mm'
  }

  if (dateDiff < 180) {
    t = 'MM月DD日'
    if (withTime) {
      t = 'MM月DD日 HH时mm'
    }
  }

  const dateStr = format(dateVal, t)
  if (dateStr === 'Invalid Date') return ''
  return dateStr
}

/**
 * 解析日期字符串
 * @param str 字符串
 * @param format 格式
 * @param locale 本地化语言（需要导入dayjs语言）
 * @param strict 严格模式（要求格式和输入内容完全匹配，包括分隔符）
 * @returns
 */
export function parse(str: string, format?: string, locale?: string, strict?: boolean): Date {
  if (!str) {
    return new Date('')
  }

  const date = dayjs(str, format, locale, strict).toDate()
  return date
}

/**
 * 新增年
 * @param dateVal 日期值
 * @param years 年数
 * @returns
 */
export function addYears(dateVal: DateValue, years: number): Date {
  return dayjs(dateVal).add(years, 'y').toDate()
}

/**
 * 新增月
 * @param dateVal 日期值
 * @param months 月数
 * @returns
 */
export function addMonths(dateVal: DateValue, months: number): Date {
  return dayjs(dateVal).add(months, 'm').toDate()
}

/**
 * 新增日
 * @param dateVal 日期值
 * @param days 天数
 * @returns
 */
export function addDays(dateVal: DateValue, days: number): Date {
  return dayjs(dateVal).add(days, 'd').toDate()
}

/**
 * 新增时
 * @param dateVal 日期值
 * @param hours 小时数
 * @returns
 */
export function addHours(dateVal: DateValue, hours: number): Date {
  return dayjs(dateVal).add(hours, 'h').toDate()
}

/**
 * 新增分
 * @param dateVal 日期值
 * @param minutes 分钟数
 * @returns
 */
export function addMinutes(dateVal: DateValue, minutes: number): Date {
  return dayjs(dateVal).add(minutes, 'm').toDate()
}

/**
 * 新增秒
 * @param dateVal 日期值
 * @param seconds 秒数
 * @returns
 */
export function addSeconds(dateVal: DateValue, seconds: number): Date {
  return dayjs(dateVal).add(seconds, 's').toDate()
}

/**
 * 新增毫秒
 * @param dateVal 日期值
 * @param milliSeconds 毫秒数
 * @returns
 */
export function addMilliSeconds(dateVal: DateValue, milliSeconds: number): Date {
  return dayjs(dateVal).add(milliSeconds, 'ms').toDate()
}

/**
 * 日期差距
 * @param formDate
 * @param toDate
 * @param unit
 * @returns
 */
export function diff(formDate: DateValue, toDate: DateValue, unit?: QUnitType | OpUnitType) {
  return dayjs(formDate).diff(toDate, unit)
}

/**
 * 是否有效的时间
 * @param date
 * @returns
 */
export function isValid(date: any) {
  return !!date.getTime() && !isNaN(date.getTime())
}

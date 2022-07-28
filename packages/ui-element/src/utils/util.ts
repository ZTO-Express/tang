import { _ } from '@zto/zpage'

/**
 * 获取表单上下文
 * @param payload
 * @param context
 * @returns
 */
export function parseCssClass(cls: Record<string, boolean> | string) {
  if (cls && _.isString(cls)) return { [cls as string]: true }
  return (cls || {}) as Record<string, boolean>
}

/**
 * 获取icon属性
 * @param icon
 * @returns
 */
export function getFullIconClass(icon?: any, defaultValue?: string) {
  if (!icon) return defaultValue

  let _iconClass: any = {}

  if (_.isString(icon)) {
    _iconClass = getIconClass(icon)
  } else if (icon?.name) {
    const iconCls = getIconClass(icon.name)
    _iconClass = { [iconCls]: true, ...parseCssClass(icon.class) }

    if (icon.color) {
      const colorCls = getTextColorClass(icon.color)
      _iconClass[colorCls] = true
    }
  }

  return _iconClass
}

/**
 * 获取icon类
 * @param icon
 */
export function getIconClass(icon?: string, defaultValue?: string) {
  if (!icon) return defaultValue || ''
  if (icon.startsWith('el-icon-')) return icon
  return `el-icon-${icon}`
}

/**
 * 获取文本类
 * @param text
 * @returns
 */
export function getTextColorClass(text?: string, defaultValue?: string) {
  if (!text) return defaultValue || ''
  if (text.startsWith('text-')) return text
  return `text-${text}`
}

/**
 * 获取文本类
 * @param text
 * @returns
 */
export function getTextClass(text?: string, defaultValue?: string) {
  if (!text) return defaultValue || ''
  if (text.startsWith('text-')) return text
  return `text-${text}`
}

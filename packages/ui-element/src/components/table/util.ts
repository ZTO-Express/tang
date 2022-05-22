import { _, tpl, formatText } from '@zto/zpage'

import type { TableColumn } from './types'

/** 扁平化所有子列
 * @param columns - 所有列
 */
export function flattenChildren(columns: TableColumn[]) {
  const result: TableColumn[] = []

  const childFinder = (columns: TableColumn[]) => {
    for (const child of columns) {
      result.push(child)

      if (!child.children) continue

      childFinder(child.children)
    }
  }

  childFinder(columns)
  return result
}

/** 所有子列 的 prop熟悉
 * @param columns - 所有列
 */
export function getChildProps(columns: TableColumn[]) {
  const allColumns = flattenChildren(columns)
  return allColumns.map(c => c.prop)
}

/**
 * 获取当前列formatter方法
 * @param column 列
 */
export function getColFormatter(column: TableColumn) {
  let formatter: any = column.formatter || {}
  if (typeof formatter === 'function') return formatter

  // @ts-ignore 这里formatter可能为对象
  const formatterType = formatter.type || 'default'

  switch (formatterType) {
    case 'default':
      formatter = getDefaultColFormatterFn(column.formatter)
      break
    default:
      formatter = getDefaultColFormatterFn()
      break
  }

  return formatter
}

/** 默认表格行格式化函数 */
export function getDefaultColFormatterFn(options?: any) {
  return (row: any, col: any, cellValue: any) => {
    const dataContext = { data: row, column: col, options }

    const text = formatValue(cellValue, options, dataContext)

    return text
  }
}

/** 格式化值 */
export function formatValue(val: any, options?: any, dataContext?: any) {
  if (typeof options === 'string') options = { name: options }

  options = { prefix: '', postfix: '', ...options }

  if (_.isEmpty(val)) return options.emptyText || '--'

  let valText = String(val)

  if (options.name) {
    valText = formatText(val, options.name, { context: dataContext, ...options })
  }

  const prefix = options.prefix || ''
  const postfix = options.postfix || ''

  let text = `${prefix}${valText}${postfix}` || '--'
  if (dataContext) text = tpl.filter(text, dataContext)

  return text
}

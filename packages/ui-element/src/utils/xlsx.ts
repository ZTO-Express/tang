import type { App, AppContextOptions } from '@zto/zpage'

/** 导出数据 */
export interface ExportColumn {
  prop: string
  label?: string
  width?: number
  tpl?: string
  formatter?: Function
}

export interface Export2ExcelOptions extends AppContextOptions {
  wOpts?: any
  workBook?: any
  columns?: ExportColumn[]
  fileName?: string
  postfix?: string | boolean | Function // 导出文件名后缀
  withoutPostfix?: boolean // 导出文件不带后缀
}

export interface ParseFileOptions extends AppContextOptions {
  sheetIndex?: number
  dateIndexs?: number[] // 日期格式
}

export function exportData(data: any[], e2eOptions: Export2ExcelOptions) {
  const exportDataFn = e2eOptions.app.useComponentsConfig('xlsx.exportData')
  return exportDataFn(data, e2eOptions)
}

// 解析文件
export async function parseFile(file: File, options: ParseFileOptions) {
  const parseFileFn = options.app.useComponentsConfig('xlsx.parseFile')
  return parseFileFn(file, options)
}

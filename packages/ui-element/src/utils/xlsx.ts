/** 导出数据 */
import { HostApp } from '@zto/zpage'

export interface ExportColumn {
  prop: string
  label?: string
  width?: number
}

interface Export2ExcelOptions {
  wOpts?: any
  workBook?: any
  columns?: ExportColumn[]
  fileName?: string
}

interface ParseFileOptions {
  sheetIndex?: number
  dateIndexs?: number[] // 日期格式
}

export function exportData(data: any[], e2eOptions?: Export2ExcelOptions) {
  const exportDataFn = HostApp.useConfig('components.xlsx.exportData')
  return exportDataFn(data, e2eOptions)
}

// 解析文件
export async function parseFile(file: File, options?: ParseFileOptions) {
  const parseFileFn = HostApp.useConfig('components.xlsx.parseFile')
  return parseFileFn(file, options)
}

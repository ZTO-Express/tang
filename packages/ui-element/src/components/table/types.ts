export interface TableColumn {
  prop: string
  label: string
  width?: string
  formatter?: () => string
  showHeader?: boolean
  showSlot?: boolean
  children?: TableColumn[]
  rules: Array<any>
  editor: any

  [prop: string]: any
}

export interface TablePager {
  pageIndex: number
  curPageIndex: number // 上一次查询页
  pageSize?: number
  [prop: string]: any
}

export interface TableData {
  data: any[]
  total: number
  summary: Record<string, any>
}

export type TableAdapter = (
  payload: { pageIndex: number; pageSize: number } & Record<string, any>
) => Promise<TableData>

export interface SummaryMethodParams {
  columns: object[]
  data: object
}

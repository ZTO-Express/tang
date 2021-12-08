/** 导出数据 */
import XLSX from 'xlsx'
import { fileUtil, dateUtil } from '@zto/zpage'
import type { WritingOptions, WorkBook, WorkSheet, Sheet2JSONOpts } from 'xlsx'

export interface ExportColumn {
  prop: string
  label?: string
  width?: number
}

interface Export2ExcelOptions {
  wOpts?: WritingOptions
  workBook?: WorkBook
  columns?: ExportColumn[]
  fileName?: string
}

interface ParseFileOptions extends Sheet2JSONOpts {
  sheetIndex?: number
  dateIndexs?: number[] // 日期格式
}

export function exportData(data: any[], e2eOptions?: Export2ExcelOptions) {
  e2eOptions = Object.assign({}, e2eOptions)

  const wOpts = Object.assign(
    {
      bookType: 'xlsx',
      bookSST: false,
      type: 'binary'
    },
    e2eOptions.wOpts
  ) as WritingOptions

  const workBook = Object.assign(
    {
      SheetNames: ['Sheet1'],
      Sheets: {},
      Props: {}
    },
    e2eOptions.workBook
  ) as WorkBook

  // 根据columns定义获取标题，显示顺序及列属性
  let exportTitles: any = undefined
  const exportHeader: string[] = []
  const columProps: any[] = []

  if (e2eOptions.columns) {
    exportTitles = {}

    e2eOptions.columns.forEach(col => {
      exportHeader.push(col.prop)
      exportTitles[col.prop] = col.label || col.prop

      columProps.push({ wpx: col.width || 100 })
    })
  }

  // 过滤不显示的数据
  if (exportHeader.length) {
    data = data.reduce((prevData, d) => {
      const _it = exportHeader.reduce((p: Record<string, any>, h) => {
        p[h] = d[h]
        return p
      }, {})

      prevData.push(_it)
      return prevData
    }, [])
  }

  const workSheet = XLSX.utils.json_to_sheet(data, {
    header: exportHeader
  })

  // 封装表头
  if (exportTitles && workSheet['!ref']) {
    const range = XLSX.utils.decode_range(workSheet['!ref'])

    for (let c = range.s.c; c <= range.e.c; c++) {
      const header = XLSX.utils.encode_col(c) + '1'
      workSheet[header].v = exportTitles[workSheet[header].v]
    }
  }

  if (columProps) {
    workSheet['!cols'] = columProps
  }

  workBook.Sheets[workBook.SheetNames[0]] = workSheet

  const exportData = formatData(XLSX.write(workBook, wOpts))

  const bolb = new Blob([exportData], { type: 'application/octet-stream' })

  saveAs(bolb, e2eOptions.fileName, 'xlsx')
}

export function formatData(s: any) {
  //1、创建一个字节长度为s.length的内存区域
  const buf = new ArrayBuffer(s.length)

  //2、创建一个指向buf的Unit8视图，开始于字节0，直到缓冲区的末尾
  const view = new Uint8Array(buf)

  //3、返回指定位置的字符的Unicode编码
  for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
  return buf
}

export function saveAs(obj: any, fileName?: string, extName?: string) {
  if (!fileName) {
    fileName = new Date().getTime() + ''
  }

  if (extName) {
    fileName += `.${extName}`
  }

  const tmpa = document.createElement('a')
  tmpa.download = fileName
  tmpa.href = URL.createObjectURL(obj)
  tmpa.click() //模拟点击实现下载

  setTimeout(function () {
    //延时释放
    URL.revokeObjectURL(obj) //用URL.revokeObjectURL()来释放这个object URL
  }, 100)
}

export function parseWorkbook(workbook: WorkBook, sheetIndex?: number | Sheet2JSONOpts, options?: Sheet2JSONOpts) {
  if (sheetIndex && typeof sheetIndex === 'object') {
    options = sheetIndex as Sheet2JSONOpts
    sheetIndex = undefined
  }

  if (typeof sheetIndex === 'number') {
    const sheetName = workbook.SheetNames[sheetIndex]
    return parseWorksheet(workbook.Sheets[sheetName], options)
  }

  const result: Record<string, any> = {}
  workbook.SheetNames.forEach(function (sheetName) {
    const roa = parseWorksheet(workbook.Sheets[sheetName], options)
    if (roa.length > 0) result[sheetName] = roa
  })

  return result
}

export function parseWorksheet(worksheet: WorkSheet, options?: Sheet2JSONOpts) {
  options = Object.assign(
    {
      header: 1
    },
    options
  )
  const result = XLSX.utils.sheet_to_json(worksheet, options)

  return result
}

// 调整xlsx日期, 上海时间为+8:5:43, 转换后会丢失43秒,这里进行调整
export function adjustXlsxDate(date: any) {
  return dateUtil.addSeconds(date, 43)
}

// 解析文件
export async function parseFile(file: File, options?: ParseFileOptions) {
  options = Object.assign(
    {
      sheetIndex: 0
    },
    options
  )

  const data = await fileUtil.read(file, {
    readAs: 'binaryString'
  })

  const wb = XLSX.read(data, { type: 'binary', cellDates: true, dateNF: 'dd/mm/yyyy' })
  const sheetIndex = options.sheetIndex
  const json = parseWorkbook(wb, sheetIndex, options)

  return json
}

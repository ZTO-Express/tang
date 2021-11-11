/**
 * 获取图表组件类型
 * @param itemType
 */
export function normalizeChartOption(option: any, data: any, options: any = {}) {
  if (!option.xAxis.data?.length && option.xAxis.dataProp) {
    option.xAxis.data = data.map((it: any) => it[option.xAxis.dataProp])
  }

  if (!option.yAxis.data?.length && option.yAxis.dataProp) {
    option.yAxis.data = data.map((it: any) => it[option.yAxis.dataProp])
  }

  if (Array.isArray(option.series)) {
    option.series.forEach((it: any, index: number) => {
      it.type = it.type || options.serieType
      const dataProp = it.dataProp

      if (!it.data?.length && dataProp) {
        it.data = data.map((_it: any) => _it[dataProp])
      }
    })
  }

  return option
}

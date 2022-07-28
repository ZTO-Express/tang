/**
 * 获取图表组件类型
 * @param itemType
 */
export function normalizeChartOption(option: any, data: any, options: any = {}) {
  if (!option.xAxis?.data?.length && option.xAxis?.dataProp) {
    option.xAxis.data = data.map((it: any) => it[option.xAxis.dataProp])
  }

  if (!option.yAxis?.data?.length && option.yAxis?.dataProp) {
    option.yAxis.data = data.map((it: any) => it[option.yAxis.dataProp])
  }

  if (Array.isArray(option.series)) {
    option.series.forEach((it: any, index: number) => {
      it.type = it.type || options.serieType
      const dataProp = it.dataProp
      if (!it.data?.length && dataProp) {
        it.data = dataProp
      }

      // if (!it.data?.length && dataProp) {
      //   it.data = data.map((_it: any) => {
      //     return _it[dataProp]
      //   }
      //   )
      // }
    })
  }
  return option
}

type Attrs = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// Copied from
// https://github.com/vuejs/vue-next/blob/5a7a1b8293822219283d6e267496bec02234b0bc/packages/shared/src/index.ts#L40-L41
const onRE = /^on[^a-z]/
export const isOn = (key: string): boolean => onRE.test(key)

export function omitOn(attrs: Attrs): Attrs {
  const result: Attrs = {}
  for (const key in attrs) {
    if (!isOn(key)) {
      result[key] = attrs[key]
    }
  }

  return result
}

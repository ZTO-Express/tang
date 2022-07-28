<template>
  <!-- <div>暂未实现</div> -->
  <!-- <v-chart ref="chartRef" class="c-chart" :option="chartOption" v-bind="options" /> -->
  <e-charts ref="chartRef" class="c-chart" :option="chartOption" v-bind="options" />
</template>

<script lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, ToolboxComponent } from 'echarts/components'

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
])
</script>

<script setup lang="ts">
import { ref, watch, onMounted } from '@zto/zpage'
import ECharts from './ECharts'

import { normalizeChartOption } from './utils'

const props = withDefaults(
  defineProps<{
    options: Record<string, any> // 图表选项
    data?: Record<string, any> // 图表数据
  }>(),
  {}
)

const chartRef = ref<any>()
const chartOption = ref<any>({})

watch(
  () => [props.options, props.data],
  () => {
    loadChart()
  }
)

onMounted(() => {
  loadChart()
})

function loadChart() {
  const options = props.options
  if (!options) return
  chartOption.value = normalizeChartOption(options.option, props.data, props.options)
  chartRef.value.setOption(chartOption.value)
}
</script>

<style lang="scss" scoped>
.c-chart {
  height: 400px;
}
</style>

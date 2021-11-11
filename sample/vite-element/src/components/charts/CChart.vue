<template>
  <v-chart ref="chartRef" class="c-chart" :option="chartOption" v-bind="options" />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import 'echarts/lib/component/grid'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
} from 'echarts/components'

import VChart, { THEME_KEY } from 'vue-echarts'

import { normalizeChartOption } from './utils'

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
])

const props = withDefaults(
  defineProps<{
    options: GenericObject // 图表选项
    data: GenericObject // 图表数据
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

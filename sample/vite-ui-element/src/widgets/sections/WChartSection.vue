<template>
  <c-page-section class="w-chart-section" :title="sectionTitle">
    <template #headerExtra>
      <el-button type="text" class="q-ml-md" @click="doFetch">
        重新加载
        <i class="el-icon-refresh-right"></i>
      </el-button>
    </template>
    <div v-if="indicators.length" class="indicators-con">
      <div
        v-for="it in indicators"
        :key="it.prop"
        class="indicator"
        :class="{ active: currentIndicator === it.prop }"
        @click="handleIndicatorClick(it)"
      >
        <div class="title">
          <span>{{ filterEmpty(it.name) }}</span>
          <el-tooltip v-if="it.desc" :content="it.desc" placement="top" effect="light">
            <el-icon class="icon q-ml-xs" color="grey">
              <info-filled />
            </el-icon>
          </el-tooltip>
        </div>
        <div class="value">{{ filterEmpty(it.value) }}</div>
        <div class="rate">
          <span class="rate-name">{{ filterEmpty(it.rateName) }}</span>
          <span class="rate-precent">{{ filterEmpty(it.ratePercent) }} %</span>
        </div>
      </div>
    </div>
    <div class="chart-con">
      <c-chart v-bind="chartAttrs" />
    </div>
    <div class="detail-con" :class="{ expanded: showTable }">
      <div class="detail-title-con">
        <div class="detail-title" @click="handleToggleShowTable">
          <el-icon class="icon"><arrow-down-bold /></el-icon>
          <span class="text">明细数据</span>
        </div>
      </div>
      <div v-if="showTable" class="detail-table">
        <c-table ref="tableRef" v-bind="tableAttrs" @fetch="fetchTableData"></c-table>
      </div>
    </div>
  </c-page-section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  useStore,
  useWidgetSchema,
  tpl,
  useApiRequest,
  useAppContext,
  filterEmpty
} from '@zto/zpage'
import { ArrowDownBold, InfoFilled } from '@element-plus/icons'

// import * as mock from '../../../mock'

// 属性
const props = defineProps<{
  schema: GenericObject
}>()

const store = useStore()

// api请求
const apiRequest = useApiRequest()

const wSchema = await useWidgetSchema(props.schema)

const sChart = await useWidgetSchema(wSchema.chart || {})
const sTable = await useWidgetSchema(wSchema.table || {})
const sIndicator = await useWidgetSchema(wSchema.indicator || {})

const sectionTitle = wSchema.title || '标题'

const tableRef = ref<any>()

const fetchData = ref<any>({}) // api请求的数据
const currentIndicator = ref<string>()
const showTable = ref<boolean>(false)

const chartData = computed(() => {
  return fetchData.value?.data || []
})

const indicatorData = computed(() => {
  return fetchData.value?.indicator || []
})

const indicators = computed(() => {
  let items: any = []

  const idcData = indicatorData.value

  if (!sIndicator?.items?.length) {
    items = idcData || []
  } else {
    items = sIndicator?.items.map((it: any) => {
      if (!it.prop) return it

      const dt = idcData.find((c: any) => c.prop === it.prop)
      const idc = Object.assign({}, it, dt)

      return idc
    })
  }

  const columns = sTable.columns || []
  items.forEach((it: any) => {
    const col = columns.find((c: any) => c.prop === it.prop)

    if (col) {
      it.name = it.name || col.label
      it.desc = it.desc || col.desc
    }
  })

  return items || []
})

const tableAttrs = computed(() => {
  return {
    showOperation: false,
    ...sTable
  }
})

const chartAttrs = computed(() => {
  const option = sChart.option || {}
  option.series = indicators.value
    .filter((it: any) => it.prop === currentIndicator.value)
    .map((it: any) => {
      return { type: 'line', name: it.name, dataProp: it.prop }
    })

  return {
    options: { ...sChart, option },
    data: chartData.value
  }
})

const pageData = computed(() => {
  return store.getters.page.data
})

watch(
  () => indicators.value,
  () => {
    const indicatorItems = indicators.value
    if (!indicatorItems.length) {
      currentIndicator.value = ''
    } else if (!indicatorItems.some((it: any) => it.prop === currentIndicator.value)) {
      currentIndicator.value = indicatorItems[0].prop
    }
  }
)

watch(
  () => showTable.value,
  () => {
    if (showTable.value) {
      nextTick(() => {
        fetchTableData()
      })
    }
  }
)

watch(
  () => pageData.value,
  () => {
    doFetch()
  }
)

function handleIndicatorClick(indicator: any) {
  if (!indicator?.prop) return
  currentIndicator.value = indicator?.prop
}

function handleToggleShowTable() {
  showTable.value = !showTable.value
}

// 执行数据加载
async function doFetch() {
  // 应用上下文
  const context = useAppContext()

  const sFetch = wSchema.fetch
  if (!sFetch) return

  const payload = tpl.deepFilter(
    {
      action: sFetch.api,
      ...sFetch
    },
    context
  )

  if (!payload.params?.bhvId) return

  fetchData.value = await apiRequest(payload)
  // fetchData.value = await mock.apis.app.getEventDetail(payload)

  fetchTableData()
}

function fetchTableData() {
  if (!tableRef.value) return

  const { pageIndex, pageSize } = tableRef.value?.pager || {}

  const totalData = chartData.value
  const tableData = totalData.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
  tableRef.value?.setData({
    data: tableData,
    total: totalData.length
  })
}
</script>

<style lang="scss" scoped>
.indicators-con {
  display: flex;
  .indicator {
    position: relative;
    padding: 10px 20px;
    height: 120px;
    width: 160px;
    box-sizing: border-box;
    border: 1px solid $border-color;
    cursor: pointer;

    .title {
      font-size: 14px;
    }

    .value {
      font-size: 28px;
      line-height: 42px;
      font-weight: bold;
    }

    .rate-name {
      margin-right: 10px;
      color: $faded;
    }

    &:not(:first-child) {
      border-left: none;
    }

    &.active {
      border-color: $primary;

      .value {
        color: $primary;
      }

      &::before {
        content: '';
        position: absolute;
        display: block;
        height: calc(100% + 2px);
        width: 1px;
        top: -1px;
        left: -1px;
        background-color: #3b82fe;
      }
    }
  }
}

.chart-con {
  padding: 10px 0;
  border-bottom: 1px dashed $border-color;
}

.detail-con {
  padding: $section-padding;

  .detail-title {
    display: inline;
    padding: 0 10px;
    cursor: pointer;
    .icon {
      margin-right: 5px;
    }
  }

  &.expanded {
    .detail-title .icon {
      transform: rotate(180deg);
    }
  }
}
</style>

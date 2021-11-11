<template>
  <div class="w-cdc-biz-report">
    <div class="search-con">
      <Row class="search-row" gutter="5">
        <Col class="search-col" span="12">
          <div class="date-selector" @click="showCalendar = true">
            {{ dateText }}
          </div>
        </Col>
        <Col class="search-col" span="12">
          <div class="brand-selector" @click="showBrandPicker = true">
            {{ searchModel.brandName }}
          </div>
        </Col>
      </Row>
    </div>
    <Row class="summary-con" gutter="2">
      <Col class="summary-item" span="8">
        <div class="title">派件</div>
        <div class="content">{{ isNilText(summaryData.disp) }}</div>
      </Col>
      <Col class="summary-item" span="8">
        <div class="title">到件</div>
        <div class="content">{{ isNilText(summaryData.come) }}</div>
      </Col>
      <Col class="summary-item" span="8">
        <div class="title">问题件</div>
        <div class="content">{{ isNilText(summaryData.problem) }}</div>
      </Col>
    </Row>
    <div class="list-con">
      <div class="list-caption">每日统计明细</div>
      <div class="list-body">
        <List class="list" v-model:loading="listLoading" :finished="!listLoading">
          <Row class="list-header" gutter="2">
            <Col class="header-item" span="6"></Col>
            <Col class="header-item" span="6">派件</Col>
            <Col class="header-item" span="6">到件</Col>
            <Col class="header-item" span="6">问题件</Col>
          </Row>
          <template v-if="listData?.length">
            <Row class="list-row" v-for="it in listData" :key="it.date" gutter="2">
              <Col class="list-col" span="6">{{ it.dateStr }}</Col>
              <Col class="list-col" span="6">{{ isNilText(it.dispQty) }}</Col>
              <Col class="list-col" span="6">{{ isNilText(it.comeQty) }}</Col>
              <Col class="list-col" span="6">{{ isNilText(it.problemQty) }}</Col>
            </Row>
          </template>
          <template v-else>
            <Empty image="search" description="暂无数据">
              <div class="text-center">
                <Button class="fw" @click="handleRefresh">刷新</Button>
              </div>
            </Empty>
          </template>
        </List>
      </div>
    </div>

    <Calendar
      type="range"
      v-model:show="showCalendar"
      :default-date="searchModel.dateRange"
      :min-date="new Date(2020, 0, 1)"
      :max-date="new Date()"
      @confirm="handleCalendarConfirm"
    />
    <Popup v-model:show="showBrandPicker" position="bottom">
      <Picker
        title="选择品牌"
        :columns="brandColumns"
        @confirm="handleBrandPickerConfirm"
        @cancel="showBrandPicker = false"
      />
    </Popup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useWidgetSchema, useApi, dateUtil } from '@zto/zpage'

import { Calendar, Popup, Picker } from 'vant'

const route = useRoute()
const cdcApi = useApi('cdc')

// 属性
const props = defineProps<{
  schema: GenericObject
}>()

const wSchema = await useWidgetSchema(props.schema)

const showCalendar = ref(false)
const showBrandPicker = ref(false)
const listLoading = ref(false)
const listLoaded = ref(false)

const searchModel = reactive<any>({
  dateRange: [],
  expressCd: '',
  brandName: ''
})

const brandList = ref<any[]>([])
const summaryData = ref<any>({})
const listData = ref<any[]>([])

const brandColumns = computed(() => {
  const columns = brandList.value.map(it => {
    return { value: it.expressCd, text: it.fullName }
  })

  return [{ value: '', text: '全部品牌' }, ...columns]
})

const dateText = computed(() => {
  const startText = dateUtil.format(searchModel.dateRange[0], 'MM.DD')
  const endText = dateUtil.format(searchModel.dateRange[1], 'MM.DD')
  return `${startText} ~ ${endText}`
})

onMounted(async () => {
  const today = new Date()
  searchModel.dateRange = [dateUtil.addDays(today, -30), today]
  searchModel.expressCd = ''
  searchModel.brandName = '全部品牌'

  await doFetch()
})

async function handleRefresh() {
  await doFetch()
}

function handleCalendarConfirm(values: any[]) {
  searchModel.dateRange = values

  showCalendar.value = false

  doFetch()
}

function handleBrandPickerConfirm(data: any) {
  searchModel.expressCd = data.value
  searchModel.brandName = data.text

  showBrandPicker.value = false

  doFetch()
}

async function doFetch() {
  listLoading.value = true

  try {
    if (!brandList.value?.length) {
      await getBrandList()
    }

    const postData = {
      expressCd: searchModel.expressCd,
      startDate: dateUtil.format(searchModel.dateRange[0], 'date') + ' 00:00:00',
      endDate: dateUtil.format(searchModel.dateRange[1], 'date') + ' 23:59:59'
    }

    const res = await cdcApi.post('tuxi.billScanRecord.queryAppClassifyStatistic', postData)

    summaryData.value = {
      disp: res.dispCount,
      come: res.comeCount,
      problem: res.problemCount
    }

    listData.value = res.items
  } catch {}

  listLoading.value = false
}

async function getBrandList() {
  brandList.value = await cdcApi.post('express.brand.all')
  return brandList.value
}

function isNilText(val: any) {
  return !val && val !== 0 ? '--' : val
}
</script>

<style lang="scss" scoped>
.search-con {
  padding: 5px;
}

.date-selector {
  cursor: pointer;
  background: white;
  padding: 0.4rem 1rem;
  height: 1.5rem;
}

.brand-selector {
  cursor: pointer;
  background: white;
  padding: 0.4rem 1rem;
  height: 1.5rem;
}

.summary-con {
  text-align: center;
  padding: 10px;
  background: white;
  margin-top: 2px;
}

.summary-item {
  & > .content {
    padding: 5px;
    font-weight: bold;
  }
}

.list-caption {
  padding: 10px;
  font-weight: bold;
}

.list-body {
  background: white;

  height: calc(100vh - 13rem);
  overflow: scroll;
}

.list-header {
  text-align: center;
  padding: 5px;
  font-weight: bold;
}

.list-row {
  text-align: center;
}

.list-col {
  padding: 5px;
}
</style>

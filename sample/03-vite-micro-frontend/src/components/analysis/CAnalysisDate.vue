<template>
  <div class="c-analysis-date">
    <div class="date-select">
      <el-button-group>
        <el-button :class="{ acitve: isToday }" @click="handleDateClick(0)">今天</el-button>
        <el-button :class="{ acitve: isYesterday }" @click="handleDateClick(-1, -1)">昨天</el-button>
        <el-button :class="{ acitve: isLast7Days }" @click="handleDateClick(-7)">过去7天</el-button>
        <el-button :class="{ acitve: isLast30Days }" @click="handleDateClick(-30)">过去30天</el-button>
      </el-button-group>
    </div>
    <div class="date-range">
      <c-date-range-picker v-model:from="dateFrom" v-model:to="dateTo" v-bind="$attrs" :max-range="maxRange" />
    </div>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { dateUtil } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    maxRange: number
    beforeToday: boolean
  }>(),
  {
    maxRange: 30,
    beforeToday: true
  }
)

const emit = defineEmits(['update:from', 'update:to', 'change'])

const dateFrom = ref<string>()
const dateTo = ref<string>()

/** 是否今天 */
const isToday = computed(() => {
  return isTargetDates(0)
})

/** 是否昨天 */
const isYesterday = computed(() => {
  return isTargetDates(-1, -1)
})

/** 是否最近7天 */
const isLast7Days = computed(() => {
  return isTargetDates(-7)
})

/** 是否最近30天 */
const isLast30Days = computed(() => {
  return isTargetDates(-30)
})

watch(
  () => [dateFrom.value, dateTo.value],
  () => {
    emit('update:from', dateFrom.value)
    emit('update:to', dateTo.value)
    emit('change', {
      from: dateFrom.value,
      to: dateTo.value
    })
  },
  {
    immediate: true
  }
)

onMounted(() => {
  setTargetDates(0)
})

function handleDateClick(days: number, offsetDays = 0) {
  setTargetDates(days, offsetDays)
}

/** 是否目标日期 */
function isTargetDates(days: number, offsetDays = 0) {
  const startDate = dateUtil.addDays(new Date(), days)
  const endDate = dateUtil.addDays(new Date(), offsetDays)

  const startStr = formatDate(startDate)
  const endStr = formatDate(endDate)

  return startStr === dateFrom.value && endStr === dateTo.value
}

/** 设置目标日期 */
function setTargetDates(days: number, offsetDays = 0) {
  const startDate = dateUtil.addDays(new Date(), days)
  const endDate = dateUtil.addDays(new Date(), offsetDays)

  dateFrom.value = formatDate(startDate)
  dateTo.value = formatDate(endDate)
}

/** 根据开始日期获取结束日期 */
function getEndDateByStartDate(startDate: Date, offset: number) {
  const start = dateFrom.value ? new Date(startDate) : new Date()
  let end = dateUtil.addDays(new Date(start), 30)
  if (props.beforeToday && end > new Date()) {
    end = new Date()
  }

  return end
}

/** 格式化日期 */
function formatDate(dateVal: Date) {
  return dateUtil.format(dateVal, 'date')
}
</script>

<style lang="scss" scoped>
.c-analysis-date {
  display: flex;

  .date-select {
    line-height: 38px;
    .acitve {
      color: $primary;
    }
  }

  .date-range {
    flex: 1;
    width: 200px;
    margin-left: 10px;
  }
}
</style>

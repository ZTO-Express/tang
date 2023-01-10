<template>
  <el-date-picker
    v-model="model[prop]"
    v-bind="innerAttrs"
    type="datetime"
    placeholder="请选择"
    :disabled-date="disabledDate"
    :disabled-hours="disabledHours"
    :disabled-minutes="disabledMinutes"
    :disabled-seconds="disabledSeconds"
  />
</template>
  
<script lang="ts">
export default { inheritAttrs: false }
</script>
  
<script setup lang="ts">
import { useFormItem } from '../util'
import dayjs from 'dayjs'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
  }>(),
  {}
)

// 禁止某段的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 60 * 60 * 24 * 1 * 1000
}

const makeRange = (start: number, end: number) => {
  const result: number[] = []
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result
}

// 禁止某段的小时
const disabledHours = (day: number) => {
  const max = new Date().getHours()

  // 当前选择的日期
  const selectDate = dayjs(props.model[props.prop]).format('YYYY-MM-DD')
  // 当前日期
  const nowDate = dayjs(new Date()).format('YYYY-MM-DD')
  // 比较选择日期和当前日期，如果相等，则禁止某段的小时，不相等，不禁止
  if(selectDate === nowDate) {
    return makeRange(0, max - 1)
  }
}

// 禁止某段的分钟
const disabledMinutes = (hour: number) => {
  const minHour = new Date().getHours()
  const minMinutes = new Date().getMinutes()
  if (hour === minHour) {
    return makeRange(0, minMinutes - 1)
  }
}

// 禁止某段的秒数
const disabledSeconds = (hour: number, minute: number) => {
  const minHour = new Date().getHours()
  const minMinutes = new Date().getMinutes()
  const minSeconds = new Date().getSeconds()
  if (hour === minHour && minute === minMinutes) {
    return makeRange(0, minSeconds - 1)
  }
}

const { innerAttrs } = useFormItem(props)
</script>
  
<template>
  <el-date-picker
    v-model="innerRangeValue"
    v-bind="$attrs"
    style="width: 100%"
    type="daterange"
    :unlink-panels="unlinkPanels"
    :clearable="innerClearable"
    :disabled="disabled"
    :value-format="valueFormat"
    :disabled-date="innerDisabledDateFn"
    :readonly="readonly"
    @change="handleChange"
    @blur="handleBlur"
  ></el-date-picker>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { _, computed, ref, watch, dateUtil } from '@zto/zpage'
import { useMessage } from '../../composables'

const props = withDefaults(
  defineProps<{
    clearable?: boolean
    disabled?: boolean
    readonly?: boolean
    valueFormat?: string
    beforeToday?: boolean
    defaultFrom?: any // 默认开始时间 string | Date
    defaultTo?: any // 默认开始时间 string | Date
    defaultRange?: number // 默认时间范围(天)
    maxRange?: number // 默认最大时间范围(天)，0为无限制
    from?: string
    to?: string
    unlinkPanels?: boolean
    appendTime?: boolean // 同步时附加时分秒（如：2019-01-01, 2019-01-01；将会附加为：2019-01-01 00:00:00, 2019-01-01 23:59:59）
  }>(),
  {
    clearable: undefined,
    disabled: false,
    readonly: false,
    valueFormat: 'YYYY-MM-DD',
    beforeToday: true,
    defaultFrom: '',
    defaultTo: '',
    defaultRange: 1,
    maxRange: 0,
    from: '',
    to: '',
    unlinkPanels: false,
    appendTime: true
  }
)

const emit = defineEmits(['update:from', 'update:to', 'change'])

const { Message } = useMessage()

const innerModelValue = ref<string[]>([])
const innerRangeValue = ref<string[]>([])
const boundaryDate = ref<string[]>([]) // 时间边界，根据maxRange

const innerClearable = computed(() => {
  if (props.maxRange) return false
  if (_.isBoolean(props.clearable)) return props.clearable
  return true
})

const innerFromDate = computed(() => {
  if (!innerModelValue.value[0]) return ''
  return innerModelValue.value[0]
})

const innerToDate = computed(() => {
  if (!innerModelValue.value[1]) return ''
  return innerModelValue.value[1]
})

const innerDisabledDateFn = computed(() => {
  const fn = (time: any) => {
    if (boundaryDate.value.length) {
      return (
        time < new Date(boundaryDate.value[0]).getTime() ||
        (props.beforeToday
          ? time > new Date(boundaryDate.value[1]).getTime() || time >= Date.now()
          : time > new Date(boundaryDate.value[1]).getTime())
      )
    } else {
      if (props.beforeToday) return time >= Date.now()
    }
    return false
  }

  return fn
})

watch(
  () => props.from,
  () => {
    setFrom(props.from)
  },
  { immediate: true }
)

watch(
  () => props.to,
  () => {
    setTo(props.to)
  },
  { immediate: true }
)

watch(
  () => props.defaultFrom,
  () => {
    if (!innerFromDate.value && props.defaultFrom) {
      setFrom(props.defaultFrom)
    }
  },
  { immediate: true }
)

watch(
  () => props.defaultTo,
  () => {
    if (!innerToDate.value && props.defaultTo) {
      setTo(props.defaultTo)
    }
  },
  { immediate: true }
)

watch(
  () => innerModelValue.value,
  () => {
    const val = innerModelValue.value
    innerRangeValue.value = val
    let valFrom = val[0]
    let valTo = val[1]

    if (props.appendTime && valFrom && valTo) {
      valFrom += ' 00:00:00'
      valTo += ' 23:59:59'
    }

    emit('update:from', valFrom)
    emit('update:to', valTo)
    emit('change', [valFrom, valTo])
  },
  { immediate: true }
)

function handleChange(val: any) {
  if (props.clearable && !val) {
    val = []
  } else if (!validateRange(val, true)) {
    innerRangeValue.value = innerModelValue.value
    return
  }
  innerModelValue.value = val
}

function handleBlur() {
  boundaryDate.value = []
}

// 设置开始时间
function setFrom(from: Date | string) {
  const fromDate = new Date(from)

  if (!dateUtil.isValid(fromDate)) {
    innerModelValue.value = []
    return
  }

  const defaultRange = props.defaultRange

  let toDate = new Date(innerToDate.value)
  if (!dateUtil.isValid(toDate) && defaultRange) {
    toDate = dateUtil.addDays(new Date(from), props.defaultRange)
  }

  if (!validateRange([fromDate, toDate])) {
    return
  }

  innerModelValue.value = [dateUtil.format(fromDate, props.valueFormat), dateUtil.format(toDate, props.valueFormat)]
}

function setTo(to: Date | string) {
  if (to === 'now') to = new Date()
  const toDate = new Date(to)

  if (!dateUtil.isValid(toDate)) {
    innerModelValue.value = []
    return
  }

  const defaultRange = props.defaultRange

  let fromDate = new Date(innerFromDate.value)
  if (!dateUtil.isValid(fromDate) && defaultRange) {
    fromDate = dateUtil.addDays(new Date(to), props.defaultRange * -1 + 1)
  }

  if (!validateRange([fromDate, toDate])) {
    return
  }

  innerModelValue.value = [dateUtil.format(fromDate, props.valueFormat), dateUtil.format(toDate, props.valueFormat)]
}

function validateRange(val: Array<string | Date>, notice = false) {
  const maxRange = props.maxRange

  if (!maxRange && !val[0] && !val[1]) return

  const fromDate = new Date(val[0])
  const toDate = new Date(val[1])

  let errorMessage = ''

  if (!dateUtil.isValid(fromDate)) {
    errorMessage = '无效开始时间'
  } else if (!dateUtil.isValid(toDate)) {
    errorMessage = '无效结束时间'
  } else if (maxRange) {
    const range = dateUtil.diff(fromDate, toDate, 'day') - 1
    if (Math.abs(range) > maxRange) {
      errorMessage = `时间范围不能超过${maxRange}天`
    }
  }

  if (notice && errorMessage) {
    Message({
      type: 'warning',
      message: errorMessage,
      duration: 2 * 1000
    })
  }

  return !errorMessage
}
</script>

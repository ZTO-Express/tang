<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <el-date-picker
    v-model="model[prop]"
    v-bind="$attrs"
    :type="pickerType"
    range-separator="至"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    style="width: 100%"
    :value-format="valueFormat"
    :placeholder="$attrs.placeholder || '选择日期'"
    :disabled="disabled"
    :disabled-date="innerDisabledDateFn"
    @change="handleChange"
  />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { dateUtil, watch } from '@zto/zpage'

import { useFormItem } from '../util'

import type { GenericFunction } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    pickerType?: string
    valueFormat?: string
    disabled?: boolean
    beforeToday?: boolean
    afterToday?: boolean
    minDate?: string | Date
    maxDate?: string | Date
    disabledDate?: Function
    onChange?: GenericFunction
  }>(),
  {
    pickerType: 'date',
    beforeToday: true,
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    disabled: false
  }
)

const { handleChange } = useFormItem(props)

watch(
  () => props.model[props.prop],
  (cur, old) => {
    const val = props.model[props.prop]

    if (cur && cur !== old) {
      props.model[props.prop] = dateUtil.format(val, props.valueFormat)
    }
  }
)

const innerDisabledDateFn = function (time: any) {
  if (props.disabledDate && props.disabledDate(time)) return true
  if (props.beforeToday && time >= Date.now()) return true
  if (props.afterToday && time <= Date.now()) return true
  if (props.minDate && time < new Date(props.minDate).getTime()) return true
  if (props.maxDate && time > new Date(props.maxDate).getTime()) return true
  return false
}
</script>

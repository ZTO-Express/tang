<template>
  <van-field
    :model-value="displayValue"
    v-bind="$attrs"
    is-link
    readonly
    :label="label"
    :input-align="inputAlign"
    @click="isShowPopup = true"
  />
  <van-popup v-model:show="isShowPopup" round position="bottom">
    <van-datetime-picker
      :model-value="innerDateValue"
      v-bind="pickerAttrs"
      :type="inputType"
      :cancel-button-text="cancelText"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </van-popup>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted, dateUtil } from '@zto/zpage'
import { DatetimePicker as VanDatetimePicker } from 'vant'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    label?: string
    placeholder?: string
    inputType?: string
    format?: string
    displayFormat?: string
    clearable?: boolean
    inputAlign?: string
    pickerAttrs?: any
  }>(),
  {
    placeholder: '请选择日期',
    inputType: 'date',
    format: 'YYYY-MM-DD HH:mm:ss',
    displayFormat: 'YYYY-MM-DD',
    inputAlign: 'right',
    clearable: true
  }
)

const emit = defineEmits(['change'])

const isShowPopup = ref<boolean>(false)

const innerDateValue = ref<Date>(new Date())

const cancelText = computed(() => {
  if (props.clearable) return '清空'
  return '取消'
})

const displayValue = computed(() => {
  if (!props.model[props.prop]) return ''
  return dateUtil.format(innerDateValue.value, props.displayFormat)
})

watch(
  () => props.model[props.prop],
  cur => {
    if (cur) {
      innerDateValue.value = dateUtil.parse(cur, props.format)
    }
  }
)

watch(
  () => innerDateValue.value,
  () => {
    triggerChange()
  }
)

onMounted(() => {
  const val = props.model[props.prop]

  if (val) {
    innerDateValue.value = dateUtil.parse(val, props.format)
    triggerChange()
  }
})

function handleConfirm(val: Date) {
  innerDateValue.value = val
  isShowPopup.value = false
}

function handleCancel() {
  if (props.clearable) {
    props.model[props.prop] = ''
  }
  isShowPopup.value = false
}

function triggerChange() {
  let val = ''
  if (innerDateValue.value) {
    val = dateUtil.format(innerDateValue.value, props.format)
  }

  if (props.model[props.prop] !== val) {
    props.model[props.prop] = val
    emit('change', val)
  }
}
</script>

<style scoped lang="scss"></style>

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
    <van-picker
      :model-value="innerValue"
      v-bind="pickerAttrs"
      :columns="options"
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
import { Picker as VanPicker } from 'vant'

const emit = defineEmits(['change'])

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    label?: string
    placeholder?: string
    options?: any[]
    clearable?: boolean
    inputAlign?: string
    pickerAttrs?: any
  }>(),
  {
    options: [] as any,
    placeholder: '请选择',
    inputAlign: 'right',
    clearable: true
  }
)

const isShowPopup = ref<boolean>(false)

const innerValue = ref<string[]>([])

const cancelText = computed(() => {
  if (props.clearable) return '清空'
  return '取消'
})

const displayValue = computed(() => {
  return innerValue.value.join('/')
})

watch(
  () => props.model[props.prop],
  cur => {
    if (cur) {
      if (!Array.isArray(cur)) innerValue.value = [cur]
    }
  }
)

watch(
  () => innerValue.value,
  () => {
    triggerChange()
  }
)

onMounted(() => {
  const val = props.model[props.prop]

  if (val) {
    if (!Array.isArray(val)) innerValue.value = [val]
    triggerChange()
  }
})

function handleConfirm(item: any) {
  innerValue.value = item
  isShowPopup.value = false
}

function handleCancel() {
  if (props.clearable) props.model[props.prop] = ''
  isShowPopup.value = false
}

function triggerChange() {
  let val: any = innerValue.value

  if (!Array.isArray(val)) {
    if (innerValue.value?.length) {
      val = innerValue.value[0]
    } else {
      val = ''
    }
  }

  if (props.model[props.prop] !== val) {
    props.model[props.prop] = val
    emit('change', val)
  }
}
</script>

<style scoped lang="scss"></style>

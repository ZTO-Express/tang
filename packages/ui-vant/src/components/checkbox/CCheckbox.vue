<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="c-checkbox">
    <radio-group
      v-if="inputType === 'radio'"
      class="c-radio-group"
      v-bind="checkboxAttrs"
      v-model="innerValue"
      :disabled="disabled"
      @change="handleChange"
    >
      <radio
        v-for="(item, index) in innerOptions"
        :key="'radio' + index"
        :name="item[optionValueProp]"
        :disabled="item[optionDisabledProp]"
      >
        {{ item[optionLabelProp] }}
      </radio>
    </radio-group>

    <checkbox-group
      v-else
      class="c-checkbox-group"
      v-bind="checkboxAttrs"
      v-model="innerValue"
      :disabled="disabled"
      @change="handleChange"
    >
      <checkbox
        v-for="(item, index) in innerOptions"
        :key="'check' + index"
        :name="item[optionValueProp]"
        :disabled="item[optionDisabledProp]"
      >
        {{ item[optionLabelProp] }}
      </checkbox>
    </checkbox-group>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { ref, watch, computed, useAttrs, _, tpl, useCurrentAppInstance } from '@zto/zpage'
import { Checkbox, CheckboxGroup, Radio, RadioGroup } from 'vant'

import type { GenericFunction, ApiRequestAction } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    modelValue?: any
    inputType?: 'check' | 'radio'
    options?: Array<any> | Record<string, any>
    optionValueProp?: string
    optionLabelProp?: string
    optionDisabledProp?: string
    disabled?: boolean
    onChange?: GenericFunction

    api?: ApiRequestAction
    apiParams?: Record<string, any>
    valueProp?: string
    optionsDataProp?: string
  }>(),
  {
    inputType: 'check',
    optionValueProp: 'value',
    optionLabelProp: 'label',
    optionDisabledProp: 'disabled',
    disabled: false
  }
)

const emit = defineEmits(['update:modelValue', 'change'])

const app = useCurrentAppInstance()

const attrs = useAttrs()
const apiRequest = app.request

const innerOptions = ref<any[]>([])
const innerValue: any = ref()

if (!props.modelValue) {
  if (props.inputType === 'radio') {
    innerValue.value = ''
  } else {
    innerValue.value = []
  }
}

const checkboxAttrs = computed(() => {
  return { ...attrs }
})

watch(
  () => [props.modelValue, props.inputType],
  () => {
    if (!props.modelValue) {
      if (props.inputType === 'radio') {
        innerValue.value = ''
      } else {
        innerValue.value = []
      }
    } else {
      innerValue.value = props.modelValue
    }
  },
  {
    immediate: true
  }
)

watch(
  () => innerValue.value,
  (v: string | string[]) => {
    emit('update:modelValue', v)
  },
  {
    immediate: true
  }
)

await fetchOptions()

// 变化时触发
function handleChange(val: any) {
  innerValue.value = val
  emit('change', val)
}

// 获取options数据
async function fetchOptions() {
  const context = app.useContext()

  let optionsData: any = props.options || []

  if (props.api) {
    const params = tpl.deepFilter(props.apiParams, context)

    optionsData = await apiRequest({
      action: props.api,
      params: { ...params }
    })
  }

  if (optionsData && props.optionsDataProp) {
    innerOptions.value = optionsData[props.optionsDataProp]
  } else {
    innerOptions.value = optionsData
  }

  const valueProp = props.valueProp
  const optionValueProp = props.optionValueProp
  if (valueProp) {
    const vals = innerOptions.value.filter(v => !!v[valueProp]).map(it => it[optionValueProp])

    if (props.inputType === 'radio') {
      innerValue.value = vals[0] || ''
    } else {
      innerValue.value = vals || []
    }
  }
}

defineExpose({
  fetchOptions
})
</script>

<style lang="scss" scoped>
.c-checkbox-group,
.c-radio-group {
  height: auto;

  :deep(.van-checkbox) {
    margin-bottom: 5px;
  }

  :deep(.van-radio) {
    margin-bottom: 5px;
  }
}
</style>

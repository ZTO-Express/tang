<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="c-checkbox">
    <el-radio-group
      v-if="checkType === 'radio'"
      class="c-radio-group"
      v-bind="checkAttrs"
      v-model="innerValue"
      :disabled="disabled"
      @change="handleChange"
    >
      <template v-if="buttonType === 'button'">
        <el-radio-button
          v-for="(item, index) in innerOptions"
          :key="'radio' + index"
          :label="item[optionValueProp]"
          :disabled="item[optionDisabledProp]"
        >
          {{ item[optionLabelProp] }}
        </el-radio-button>
      </template>
      <template v-else>
        <el-radio
          v-for="(item, index) in innerOptions"
          :key="'radio' + index"
          :label="item[optionValueProp]"
          :disabled="item[optionDisabledProp]"
        >
          {{ item[optionLabelProp] }}
        </el-radio>
      </template>
    </el-radio-group>

    <el-checkbox-group
      v-else
      class="c-checkbox-group"
      v-bind="checkAttrs"
      v-model="innerValue"
      :disabled="disabled"
      @change="handleChange"
    >
      <template v-if="buttonType === 'button'">
        <el-checkbox-button
          v-for="(item, index) in innerOptions"
          :key="'check' + index"
          :label="item[optionValueProp]"
          :disabled="item[optionDisabledProp]"
        >
          {{ item[optionLabelProp] }}
        </el-checkbox-button>
      </template>
      <template v-else>
        <el-checkbox
          v-for="(item, index) in innerOptions"
          :key="'check' + index"
          :label="item[optionValueProp]"
          :disabled="item[optionDisabledProp]"
        >
          {{ item[optionLabelProp] }}
        </el-checkbox>
      </template>
    </el-checkbox-group>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { vue, _, tpl, useApiRequest, useAppContext } from '@zto/zpage'

import type { GenericFunction, ApiRequestAction } from '@zto/zpage'

const { ref, watch, computed, useAttrs } = vue

const props = withDefaults(
  defineProps<{
    modelValue?: any
    checkType?: 'check' | 'radio'
    buttonType?: string
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
    checkType: 'check',
    buttonType: 'auto', // auto, button
    optionValueProp: 'value',
    optionLabelProp: 'label',
    optionDisabledProp: 'disabled',
    disabled: false
  }
)

const emit = defineEmits(['update:modelValue', 'change'])

const attrs = useAttrs()
const apiRequest = useApiRequest()

const innerOptions = ref<any[]>([])
const innerValue: any = ref()

if (!props.modelValue) {
  if (props.checkType === 'radio') {
    innerValue.value = ''
  } else {
    innerValue.value = []
  }
}

const checkAttrs = computed(() => {
  return { ...attrs }
})

watch(
  () => [props.modelValue, props.checkType],
  () => {
    if (!props.modelValue) {
      if (props.checkType === 'radio') {
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
  const context = useAppContext()

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

    if (props.checkType === 'radio') {
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
  height: 28px;
}
</style>

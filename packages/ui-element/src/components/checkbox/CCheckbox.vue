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
      :style="{ 'vertical-align': buttonType === 'button' ? 'text-bottom' : '' }"
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
          :key="'check_${index}'"
          :label="item[optionValueProp]"
          :disabled="item[optionDisabledProp]"
        >
          {{ item[optionLabelProp] }}
        </el-checkbox-button>
      </template>
      <template v-else>
        <el-checkbox
          v-for="(item, index) in innerOptions"
          :key="'check_${index}'"
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
import { _, tpl, ref, watch, computed, useAttrs, useCurrentAppInstance } from '@zto/zpage'

import type { GenericFunction, ApiRequestAction } from '@zto/zpage'

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

    api?: ApiRequestAction
    apiParams?: Record<string, any>
    valueProp?: string
    optionsDataProp?: string

    onChange?: GenericFunction
    onDataLoad?: GenericFunction

    singleCheck?: boolean // 单个值（针对 checkType为check，只有一个值）
    uncheckValue?: string | number
  }>(),
  {
    checkType: 'check',
    buttonType: 'auto', // auto, button
    optionValueProp: 'value',
    optionLabelProp: 'label',
    optionDisabledProp: 'disabled',
    disabled: false,
    uncheckValue: '' // 未选中时值，一般配合singleCheck使用
  }
)

const emit = defineEmits(['update:modelValue', 'change'])

const attrs = useAttrs()

const app = useCurrentAppInstance()
const appApi = app.api

const innerOptions = ref<any[]>([])
const innerValue: any = ref()

// 没有传默认值，并且要过滤掉 默认值为0 这种情况
if (_.isNil(props.modelValue)) {
  if (props.checkType === 'radio') {
    innerValue.value = props.uncheckValue
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
    // 没有传默认值，并且要过滤掉 默认值为0 这种情况
    if (_.isNil(props.modelValue)) {
      if (props.checkType === 'radio') {
        innerValue.value = props.uncheckValue
      } else {
        innerValue.value = []
      }
    } else {
      if (props.singleCheck) {
        innerValue.value = [props.modelValue]
      } else {
        innerValue.value = props.modelValue
      }
    }
  },
  {
    immediate: true
  }
)

watch(
  () => innerValue.value,
  (v: string | string[]) => {
    let val: any = v

    if (props.checkType === 'check' && props.singleCheck) {
      if (v.length) {
        val = v[v.length - 1]
      } else {
        val = props.uncheckValue
      }
    }

    emit('update:modelValue', val)
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
  let optionsData: any = props.options || []

  if (props.api) {
    const params = app.deepFilter(props.apiParams)

    const res = await appApi.request({
      action: props.api,
      params: { ...params }
    })

    optionsData = Array.isArray(res) ? res : res.data || []
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

    if (props.checkType === 'radio' || props.singleCheck) {
      innerValue.value = vals[0]
    } else {
      innerValue.value = vals || []
    }
  }

  if (props.onDataLoad) {
    const context = app.useContext(optionsData)
    await props.onDataLoad(context)
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
  display: inline-block;
}
</style>

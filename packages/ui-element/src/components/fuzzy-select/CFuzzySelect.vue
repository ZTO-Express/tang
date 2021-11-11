<template>
  <el-select
    ref="selectRef"
    v-bind="$attrs"
    style="width: 100%"
    :model-value="innerValue"
    :multiple="multiple"
    :filterable="filterable"
    :remote="remote"
    :placeholder="$attrs.placeholder || '请输入关键词'"
    :remote-method="execRemoteMethod"
    :loading="loading"
    :collapse-tags="collapseTags"
    :value-key="modelValueKey"
    @change="handleSelectChange"
    @focus="handleFocusChange"
  >
    <template #prefix>
      <slot name="prefix"><i v-if="!multiple" class="el-icon-search"></i></slot>
    </template>
    <template v-if="groupLabels && groupLabels.length">
      <el-option-group v-for="label in groupLabels" :key="label" :label="label">
        <el-option
          v-for="(item, i) in getOptionsByLabel(label)"
          :key="getValueByPath(item, modelValueKey)"
          :label="getOptionLabel(item)"
          :value="getOptionValue(item)"
          v-bind="item"
        >
          <slot
            name="option"
            :data="item"
            :label="getOptionLabel(item)"
            :value="getOptionValue(item)"
            :$index="i"
          >
            <span>{{ getOptionDisplay(item) }}</span>
          </slot>
        </el-option>
      </el-option-group>
    </template>
    <template v-else>
      <el-option
        v-for="(item, i) in fuzzyOptions"
        :key="getValueByPath(item, modelValueKey)"
        :label="getOptionLabel(item)"
        :value="getOptionValue(item)"
        v-bind="item"
      >
        <slot
          name="option"
          :data="item"
          :label="getOptionLabel(item)"
          :value="getOptionValue(item)"
          :$index="i"
        >
          <span>{{ getOptionDisplay(item) }}</span>
        </slot>
      </el-option>
    </template>
  </el-select>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, watch, nextTick } from 'vue'
import { _, tpl, useApiRequest, useAppContext, useConfig } from 'zpage'

import type { FuzzySelectOption, FuzzySelectRemoteMethod, FuzzySelectResponse } from './types'

// import { selectKey as ElSelectKey } from 'element-plus'

const props = withDefaults(
  defineProps<{
    modelValue?: any
    modelLabel?: any
    optionData?: GenericObject
    multiple?: boolean
    filterable?: boolean

    modelValueKey?: string
    groupProp?: string
    labelProp?: string
    valueProp?: string
    tpl?: string

    returnLabel?: boolean
    triggerFocus?: boolean
    collapseTags?: boolean

    api?: string
    params?: GenericObject
    remote?: boolean
    remoteMethod?: GenericFunction
  }>(),
  {
    modelValue: '',
    modelLabel: '',
    multiple: false,
    filterable: true,
    modelValueKey: '',
    groupProp: '',
    labelProp: '',
    valueProp: '',
    returnLabel: false,
    triggerFocus: false,
    collapseTags: true,
    api: '',
    remote: true
  }
)

const config = useConfig('components.fuzzySelect', {})

// const innerSelect = inject<any>(ElSelectKey)

const innerRemoteMethod = computed<FuzzySelectRemoteMethod>(() => {
  return (props.remoteMethod || config.remoteMethod) as any
})

const emit = defineEmits(['change', 'update:label', 'update:modelValue'])

const attrs = useAttrs()

const apiRequest = useApiRequest()

const selectRef = ref<any>()

const loading = ref(false)

const innerLabelProp = ref(props.labelProp || 'name')
const innerValueProp = ref(props.valueProp || 'code')

// 远程查询出来的选项
const remoteFuzzyOptions = ref<FuzzySelectOption[]>([])
const fuzzyOptions = ref<FuzzySelectOption[]>([])
const groupLabels = ref<any[]>([])

const innerLabel: any = ref(props.modelLabel)
const innerValue: any = ref(props.modelValue)

watch(
  () => innerValue.value,
  (v: string | string[]) => {
    emit('update:modelValue', v)
  },
  {
    immediate: true
  }
)

watch(
  () => [props.modelLabel, props.modelValue, props.optionData, remoteFuzzyOptions.value],
  cur => {
    innerLabel.value = props.modelLabel
    innerValue.value = props.modelValue

    const label = innerLabel.value
    const optionData = props.optionData

    const options: any[] = remoteFuzzyOptions.value

    const pushOption = (label: string, value: any, optionData: any) => {
      const option = options.find(option => getOptionValue(option) === value)

      if (!option) {
        options.push({
          ...(optionData || {}),
          [innerLabelProp.value]: label,
          [innerValueProp.value]: value
        })
      }
    }

    if (props.multiple && Array.isArray(innerValue.value)) {
      for (const [idx, value] of innerValue.value.entries()) {
        pushOption(label[idx] as string, value, optionData?.[idx])
      }
    } else if (label && !_.isNil(innerValue.value)) {
      pushOption(label as string, innerValue.value, optionData)
    }

    fuzzyOptions.value = options
  },
  {
    immediate: true
  }
)

// 当不是远程搜索时候，只有在第一次 focus 时候获取数据，其它时候不加载数据 例如只有几个枚举
const firstNoRemote = ref(true)

// 通过 labelName 在option中获取label
function getOptionLabel(option: FuzzySelectOption) {
  return option[innerLabelProp.value] || ''
}

// 通过 labelName 在option中获取value
function getOptionValue(option: FuzzySelectOption) {
  return option[innerValueProp.value] || ''
}

// 获取 option显示值
function getOptionDisplay(option: FuzzySelectOption) {
  const label = getOptionLabel(option)
  if (!props.tpl) return label
  const display = tpl.filter(props.tpl, option)
  return display
}

/**
 * 获取真实value
 * value为对象时可能需要绑定 value-key字段，value-key字段对应的则是真实value
 */
function getValueByPath(option: FuzzySelectOption, modelValueKey?: string) {
  const val = getOptionValue(option)
  const isObjectVal = !!modelValueKey

  if (isObjectVal && val) {
    return val[modelValueKey]
  }

  return val
}

function setLabel(v: string | string[]) {
  innerLabel.value = v
  props.returnLabel && emit('update:label', v)
}

function handleFocusChange() {
  // 远程搜索 如果没有options 则请求
  if (!props.triggerFocus) return

  if (props.remote) {
    execRemoteMethod()
  } else if (firstNoRemote.value || !fuzzyOptions.value.length) {
    // 非远程搜索只请求一次
    execRemoteMethod()
    firstNoRemote.value = false
  }
}

function handleSelectChange(value: string | Array<string>) {
  const label = _findLabels(value)

  innerValue.value = value
  setLabel(label)

  const valueArr = Array.isArray(value) ? value : [value]

  const options = fuzzyOptions.value.filter((it: any) =>
    valueArr.includes(it[innerValueProp.value])
  )

  const option: any = props.multiple ? undefined : options[0]

  emit('change', {
    value,
    label,
    option,
    options
  })
}

/** 根据label获取options */
function getOptionsByLabel(groupLabel: string) {
  const groupProp = props.groupProp
  if (!groupProp || !groupLabel) return

  return fuzzyOptions.value.filter(it => it[groupProp] === groupLabel)
}

async function execRemoteMethod(query?: string) {
  loading.value = true

  const context = useAppContext()
  const params = tpl.deepFilter(props.params, context)

  let methodResponse: FuzzySelectResponse = []

  if (innerRemoteMethod.value) {
    methodResponse = await innerRemoteMethod
      .value(query || '', {
        ...attrs,
        ...props,
        params
      })
      .finally(() => (loading.value = false))
  } else if (apiRequest && props.api) {
    methodResponse = await apiRequest({
      action: props.api,
      params: { keyword: query as string, ...params }
    }).finally(() => (loading.value = false))
  }

  if (!methodResponse) {
    remoteFuzzyOptions.value = []
  } else if (Array.isArray(methodResponse)) {
    remoteFuzzyOptions.value = methodResponse
  } else if (Array.isArray(methodResponse.list || methodResponse.data)) {
    remoteFuzzyOptions.value = methodResponse.list || methodResponse.data
  } else {
    remoteFuzzyOptions.value = []
  }

  nextTick(() => {
    _resolveGroupLabels()
  })
}

// 支持多选模式 并保证 label顺序与value一致
function _findLabels(value: string | Array<any>): string | string[] {
  const cachedOptions = fuzzyOptions.value

  if (Array.isArray(value) && props.multiple) {
    if (!value.length) return []

    const valueByKey: Map<string, any> = new Map()
    const valProp = innerValueProp.value
    const lblProp = innerLabelProp.value

    for (const option of cachedOptions) {
      valueByKey.set(option[valProp], option[lblProp])
    }

    const labels = value.map(val => {
      return valueByKey.get(val) || ''
    })

    return labels
  }

  const item = cachedOptions.find(option => {
    return option.value === value
  })
  return item ? item.label : ''
}

/** 如果分组，计算分组信息 */
function _resolveGroupLabels() {
  const groupProp = props.groupProp
  if (!groupProp) return

  const _groupLabels: any[] = []

  fuzzyOptions.value.forEach((it: any) => {
    const groupLabel = it[groupProp]

    if (groupLabel && !_groupLabels.includes(groupLabel)) {
      _groupLabels.push(groupLabel)
    }
  })

  groupLabels.value = _groupLabels
}

function getSelected() {
  return selectRef.value?.selected
}

defineExpose({
  getSelected
})
</script>

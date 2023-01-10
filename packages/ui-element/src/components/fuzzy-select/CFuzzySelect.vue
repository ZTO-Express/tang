<template>
  <el-select
    class="c-fuzzy-select"
    ref="selectRef"
    v-bind="$attrs"
    :model-value="innerValue"
    :multiple="multiple"
    :filterable="filterable"
    :remote="remote"
    :placeholder="$attrs.placeholder || '请输入关键词'"
    :filter-method="innerFilterMethod"
    :remote-method="execRemoteMethod"
    :loading="loading"
    :collapse-tags="collapseTags"
    :value-key="modelValueKey"
    @change="handleSelectChange"
    @focus="handleFocusChange"
  >
    <template v-if="isPrefix" #prefix>
      <slot name="prefix">
        <i v-if="filterable" class="el-icon-search"></i>
      </slot>
    </template>
    <template v-if="groupLabels && groupLabels.length">
      <el-option-group v-for="label in groupLabels" :key="label" :label="label">
        <el-option
          v-for="(item, i) in getOptionsByLabel(label)"
          :key="getValueByPath(item, modelValueKey)"
          v-bind="item"
          :label="getOptionLabel(item)"
          :value="getOptionValue(item)"
          :style="optionStyle"
        >
          <slot name="option" :data="item" :label="getOptionLabel(item)" :value="getOptionValue(item)" :$index="i">
            <div v-if="htmlTpl">
              <c-html :html="htmlTpl" :context-data="item" />
            </div>
            <span v-else>{{ getOptionDisplay(item) }}</span>
          </slot>
        </el-option>
      </el-option-group>
    </template>
    <template v-else>
      <el-option
        v-for="(item, i) in visibleOptions"
        :key="getValueByPath(item, modelValueKey)"
        v-bind="item"
        :label="getOptionLabel(item)"
        :value="getOptionValue(item)"
        :style="optionStyle"
      >
        <slot name="option" :data="item" :label="getOptionLabel(item)" :value="getOptionValue(item)" :$index="i">
          <div v-if="htmlTpl">
            <c-html :html="htmlTpl" :context-data="item" />
          </div>
          <el-tooltip
            v-else
            effect="dark"
            :content="getOptionDisplay(item)"
            placement="top"
            :disabled="!isOptionLabelPropTooltip"
          >
            <span class="option-label-display">{{ getOptionDisplay(item) }}</span>
          </el-tooltip>
        </slot>
      </el-option>
    </template>
  </el-select>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { _, tpl, computed, ref, useAttrs, useSlots, watch, nextTick, useCurrentAppInstance } from '@zto/zpage'

import type { GenericFunction, ApiRequestAction } from '@zto/zpage'
import type { FuzzySelectOption, FuzzySelectRemoteMethod, FuzzySelectResponse } from './types'

// import { selectKey as ElSelectKey } from 'element-plus'

const props = withDefaults(
  defineProps<{
    modelValue?: any
    modelLabel?: any
    optionData?: Record<string, any>
    multiple?: boolean
    filterable?: boolean
    optionStyle?: any
    keepMultipleOrder?: boolean // 是否保持多选时的顺序

    modelValueKey?: string
    keywordProp?: string
    groupProp?: string
    labelProp?: string
    valueProp?: string
    tpl?: string | Record<string, any>
    labelTpl?: string
    optionLabelPropFormatter?: (option: any) => void
    isOptionLabelPropTooltip?: boolean // 下拉选项的label是否需要tooltip（label内容太多可以开启）

    autoClearProp?: boolean
    returnLabel?: boolean
    triggerFocus?: boolean // 是否简单
    collapseTags?: boolean

    api?: ApiRequestAction | string
    apiParams?: Record<string, any>
    pageSize?: number
    remote?: boolean
    remoteMethod?: GenericFunction
    preventRemote?: boolean // 阻止远程请求
    beforeRemote?: (app: any, params: any) => boolean // 阻止远程请求
    filterMethod?: GenericFunction // 过滤方法

    dataOptionsProp?: string

    localFilter?: boolean // 是否本地过滤
    localFilterMethod?: GenericFunction // 是否本地过滤方法
  }>(),
  {
    modelValue: '',
    modelLabel: '',
    multiple: false,
    filterable: true,
    modelValueKey: '',
    keywordProp: 'keyword',

    autoClearProp: true,
    returnLabel: false,
    triggerFocus: false,
    collapseTags: true,

    api: '',
    remote: true
  }
)

const emit = defineEmits(['change', 'update:label', 'update:modelValue'])

const attrs = useAttrs()
const slots = useSlots()

// const innerSelect = inject<any>(ElSelectKey)

const app = useCurrentAppInstance()

const fuzzySelectConfig = app.useComponentsConfig('fuzzySelect', {})

const apiRequest = app.request

const selectRef = ref<any>()

const loading = ref(false)

const innerLabelProp = computed(() => props.labelProp || 'name')
const innerValueProp = computed(() => props.valueProp || 'code')

// 远程查询出来的选项
const remoteFuzzyOptions = ref<FuzzySelectOption[]>([])
const fuzzyOptions = ref<FuzzySelectOption[]>([])
const groupLabels = ref<any[]>([])
const filterOptions = ref<FuzzySelectOption[]>([])

const innerLabel: any = ref(props.modelLabel)
const innerValue: any = ref(props.modelValue)

const innerRemoteMethod = computed<FuzzySelectRemoteMethod>(() => {
  return (props.remoteMethod || fuzzySelectConfig.remoteMethod) as any
})

const isPrefix = computed(() => {
  return props.filterable || slots.prefix
})

const htmlTpl = computed(() => {
  return _.isObject(props.tpl) || _.isFunction(props.tpl) ? props.tpl : null
})

const visibleOptions = computed(() => {
  if (props.remote === false) {
    return filterOptions.value
  } else {
    return fuzzyOptions.value
  }
})

watch(
  () => [props.api, props.apiParams],
  ([curApi, curApiParams], [oldApi, oldApiParams]) => {
    if (_.deepEqual(curApi, oldApi) && _.deepEqual(curApiParams, oldApiParams)) return

    firstNoRemote.value = true
    fuzzyOptions.value = []
    remoteFuzzyOptions.value = []

    // 自动清空当前值
    if (props.autoClearProp) {
      setValueLabel(undefined, undefined)
    }
  }
)

watch(
  () => [props.modelLabel, props.modelValue, props.optionData, remoteFuzzyOptions.value],
  cur => {
    nextTick(() => {
      // 方式modelLabel和modelValue其中一个发生变化，出现相互覆盖的情况
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
    })
  },
  {
    immediate: true
  }
)

watch(
  () => fuzzyOptions.value,
  () => {
    filterOptions.value = [...fuzzyOptions.value]
  }
)

// 当不是远程搜索时候，只有在第一次 focus 时候获取数据，其它时候不加载数据 例如只有几个枚举
const firstNoRemote = ref(true)

// 通过 labelName 在option中获取label
function getOptionLabel(option: FuzzySelectOption) {
  // 如果自定义参数格式化
  if (typeof props.optionLabelPropFormatter === 'function') {
    return props.optionLabelPropFormatter(option)
  }

  // 如果有labelTpl，格式化
  if (props.labelTpl) {
    return tpl.filter(props.labelTpl, option)
  }

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

function handleFocusChange() {
  // 远程搜索 如果没有options 则请求
  if (!props.triggerFocus) return

  if (props.remote) {
    execRemoteMethod()
  } else if (firstNoRemote.value) {
    // 非远程搜索只请求一次
    execRemoteMethod()
    firstNoRemote.value = false
  } else {
    // 本地查询，关注时触发本地过滤
    innerFilterMethod()
  }
}

function handleSelectChange(value: string | Array<string>) {
  const valProp = innerValueProp.value

  const valueArr = Array.isArray(value) ? value : [value]
  const options = fuzzyOptions.value.filter((it: any) => valueArr.includes(it[valProp]))

  // 选择值数量大于1时需要判断是否保持选择顺序
  if (valueArr.length > 1 && props.keepMultipleOrder) {
    value = options.map(it => it[valProp])
  }

  const label = _findLabels(value)

  setValueLabel(value, label)

  const option: any = props.multiple ? undefined : options[0]

  emit('change', value, { value, label, option, options })
}

// 设置value值
function setValue(v: any | any[]) {
  if (!v && props.multiple) v = []
  innerValue.value = v
  emit('update:modelValue', v)
}

/** 设置label值 */
function setLabel(v: string | string[]) {
  if (!v && props.multiple) v = []

  innerLabel.value = v
  props.returnLabel && emit('update:label', v)
}

/** 同时设置Modal和value模型值 */
function setValueLabel(v: any | any[], label?: string | string[]) {
  setValue(v)

  if (!_.isUndefined(label)) {
    setLabel(label!)
  }
}

/** 根据label获取options */
function getOptionsByLabel(groupLabel: string) {
  const groupProp = props.groupProp
  if (!groupProp || !groupLabel) return

  return fuzzyOptions.value.filter(it => it[groupProp] === groupLabel)
}

function doBeforeRemote(params: any) {
  return Promise.resolve().then(() => {
    if (props.beforeRemote) {
      return props.beforeRemote(app, params)
    }
  })
}

function innerFilterMethod(keyword?: string) {
  if (props.filterMethod) {
    return props.filterMethod(keyword, fuzzyOptions)
  }

  let options: any[] = []

  if (!keyword) {
    options = [...fuzzyOptions.value]
  } else {
    options = fuzzyOptions.value.filter(it => {
      const label = getOptionDisplay(it)
      return label && label.indexOf(keyword) >= 0
    })
  }

  filterOptions.value = options
}

async function execRemoteMethod(query?: string) {
  if (props.preventRemote) return

  const context = app.useContext()
  const params = tpl.deepFilter(props.apiParams, context)

  // 根据props.beforeRemote判断是否继续运行
  const flag = await doBeforeRemote(params)
  if (flag === false) return

  loading.value = true

  let methodResponse: FuzzySelectResponse = []

  if (innerRemoteMethod.value) {
    methodResponse = await innerRemoteMethod
      .value(query || '', { ...attrs, ...props, params })
      .finally(() => (loading.value = false))
  } else if (apiRequest && props.api) {
    const pageSize = props.pageSize || fuzzySelectConfig.pageSize || 40

    const queryAction: any = typeof props.api === 'string' ? { url: props.api } : props.api || {}
    queryAction.type = 'fuzzy-select'

    const postData = _.shallowTrim({ [props.keywordProp]: query as string, ...params })

    methodResponse = await apiRequest({
      action: queryAction,
      params: postData,
      pageIndex: 1,
      pageSize
    }).finally(() => (loading.value = false))
  }

  if (!methodResponse) {
    remoteFuzzyOptions.value = []
  } else if (props.dataOptionsProp) {
    remoteFuzzyOptions.value = (methodResponse as any)[props.dataOptionsProp]
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

  const valProp = innerValueProp.value
  const lblProp = innerLabelProp.value

  if (Array.isArray(value) && props.multiple) {
    if (!value.length) return []

    const valueByKey: Map<string, any> = new Map()

    for (const option of cachedOptions) {
      valueByKey.set(option[valProp], option[lblProp])
    }

    const labels = value.map(val => {
      return valueByKey.get(val) || ''
    })

    return labels
  }

  const item = cachedOptions.find(option => {
    return option[valProp] === value
  })
  return item ? item[lblProp] : ''
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
  getSelected,
  execRemoteMethod
})
</script>

<style lang="scss" scoped>
.c-fuzzy-select {
  width: 100%;
}

.option-label-display {
  width: 100%;
  line-height: 1;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

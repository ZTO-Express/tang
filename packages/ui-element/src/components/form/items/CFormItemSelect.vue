<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-select
    v-model="model[prop]"
    v-bind="innerAttrs"
    :placeholder="innerAttrs.placeholder || '请选择'"
    :filterable="filterable"
    :collapseTags="collapseTags"
    :disabled="disabled"
    :multiple="multiple"
  >
    <template v-if="groupLabels?.length">
      <el-option-group v-for="label in groupLabels" :key="label" :label="label">
        <el-option
          v-for="(item, index) in getOptionsByLabel(label)"
          :key="'select' + index"
          :label="item[optionLabelProp || 'label']"
          :value="item[optionValueProp || 'value']"
          :disbaled="item.disabled"
        />
      </el-option-group>
    </template>
    <template v-else>
      <el-option
        v-for="(item, index) in selectOptions"
        :key="'select' + index"
        :label="item[optionLabelProp || 'label']"
        :value="item[optionValueProp || 'value']"
        :disbaled="item.disabled"
      />
    </template>
  </el-select>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { tpl, computed, ref, watch, useCurrentAppInstance } from '@zto/zpage'

import { useFormItem } from '../util'

import type { GenericFunction } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    labelProp?: string // TODO: 返回label时使用，暂不支持
    disabled?: boolean
    groupName?: string
    options?: Array<any> | GenericFunction | string
    optionLabelProp?: string
    optionValueProp?: string
    collapseTags?: boolean
    filterable?: boolean
    noWriteback?: boolean
    multiple?: boolean
  }>(),
  {
    collapseTags: true,
    filterable: false,
    disabled: false,
    noWriteback: false,
    multiple: false
  }
)

const app = useCurrentAppInstance()

const context = app.useContext(props.model)

const { innerAttrs } = useFormItem(props)

const groupLabels = ref<any[]>([])

const selectGroupName = computed(() => props.groupName)

const selectOptions = computed(() => {
  let options = props.options || []
  if (typeof props.options === 'function') {
    options = props.options(context)
  } else if (typeof props.options === 'string') {
    options = tpl.evalJS(props.options, context) || []
  }

  return (options || []) as any[]
})

watch(
  () => selectOptions.value,
  () => {
    resolveGroupLabels()
  }
)

/** 如果分组，计算分组信息 */
function resolveGroupLabels() {
  const groupNameVal = selectGroupName.value

  if (!groupNameVal) return

  const _groupLabels: any[] = []

  selectOptions.value.forEach((it: any) => {
    const groupLabel = it[groupNameVal]

    if (groupLabel && !_groupLabels.includes(groupLabel)) {
      _groupLabels.push(groupLabel)
    }
  })

  groupLabels.value = _groupLabels
}

/** 根据label获取options */
function getOptionsByLabel(groupLabel: string) {
  const groupNameVal = selectGroupName.value
  if (!groupNameVal || !groupLabel) return

  const options: any[] = selectOptions.value.filter((it: any) => it[groupNameVal] === groupLabel)
  return options
}
</script>

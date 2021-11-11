<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-select
    v-model="model[prop]"
    v-bind="$attrs"
    :placeholder="$attrs.placeholder || '请选择'"
    :filterable="$attrs.filterable !== false"
    :disabled="disabled"
    @change=";(onChange && onChange(model)) || ''"
  >
    <template v-if="groupLabels?.length">
      <el-option-group v-for="label in groupLabels" :key="label" :label="label">
        <el-option
          v-for="(item, index) in getOptionsByLabel(label)"
          :key="'select' + index"
          :label="item[optionLabel || 'label']"
          :value="item[optionValue || 'value']"
          :disbaled="item.disabled"
        />
      </el-option-group>
    </template>
    <template v-else>
      <el-option
        v-for="(item, index) in selectOptions"
        :key="'select' + index"
        :label="item[optionLabel || 'label']"
        :value="item[optionValue || 'value']"
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
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    model: GenericObject
    prop: string
    disabled?: boolean
    groupName?: string
    options?: Array<any>
    optionLabel?: string
    optionValue?: string
    onChange?: GenericFunction
  }>(),
  {
    disabled: false
  }
)

const groupLabels = ref<any[]>([])

const selectGroupName = computed(() => props.groupName)
const selectOptions = computed<any[]>(() => props.options || [])

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

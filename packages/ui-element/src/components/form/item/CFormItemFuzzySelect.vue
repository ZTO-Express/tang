<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="c-form-item-fuzzy-select">
    <el-tooltip placement="top-start" trigger="hover" :disabled="!isShowTips" :content="tipContent">
      <c-fuzzy-select
        ref="fuzzySelectRef"
        v-bind="$attrs"
        v-model="model[prop]"
        :model-label="labelProp && model[labelProp]"
        :option-data="optionProp && model[optionProp]"
        :label-prop="optionLabelProp"
        :value-prop="optionValueProp"
        :group-prop="optionGroupProp"
        :multiple="multiple"
        :disabled="disabled"
        return-label
        @update:label="handleUpdateLabelProps"
        @change="handleChange"
      />
    </el-tooltip>
    <el-form-item :prop="labelProp"></el-form-item>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, ref, unref } from 'vue'

const props = withDefaults(
  defineProps<{
    model: GenericObject
    prop: string
    disabled?: boolean
    labelProp?: string
    optionProp?: string
    optionLabelProp?: string
    optionValueProp?: string
    optionGroupProp?: string
    collapseTags?: boolean
    multiple?: boolean
    showTips?: boolean
    onChange?: GenericFunction
  }>(),
  {
    collapseTags: true,
    disabled: false
  }
)

const fuzzySelectRef = ref<any>()

// 仅多选的时候显示tips，可通过showTips关闭该功能
const isShowTips = computed(() => {
  if (!props.multiple) return false
  if (!fuzzySelectRef.value) return false

  if (props.multiple && !getSelectedOptions()?.length) return false
  const { showTips } = props
  // 默认显示
  return typeof showTips === 'boolean' ? showTips : true
})

const tipContent = computed(() => {
  const selectedOptions = getSelectedOptions()
  if (!Array.isArray(selectedOptions)) return ''
  return selectedOptions.map(option => option.currentLabel).join(',')
})

function handleUpdateLabelProps(v: string) {
  if (props.labelProp) {
    // eslint-disable-next-line vue/no-mutating-props
    props.model[props.labelProp] = v
  }
}

function handleChange(payload: any) {
  if (!props.onChange) return
  props.onChange(props.model, payload)
}

function getSelectedOptions() {
  const getSelected = fuzzySelectRef.value?.getSelected
  if (!getSelected) return undefined

  const selected = getSelected()
  return selected
}
</script>

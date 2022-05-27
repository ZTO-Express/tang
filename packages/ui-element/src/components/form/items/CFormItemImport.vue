<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="c-form-item c-form-item-import">
    <c-action v-bind="actionAttrs" :disabled="disabled" action-type="import" />
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */

import { _, computed } from '@zto/zpage'
import { useFormItem } from '../util'

import type { GenericFunction } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    model: { type: Object }
    prop: string
    type?: string
    disabled?: boolean
    importLabel?: string
    importTitle?: string
    dataProp?: string
    onClick?: GenericFunction
  }>(),
  {
    disabled: false,
    importLabel: '导入',
    dataProp: 'data'
  }
)

const { allAttrs } = useFormItem(props)

const actionAttrs = computed(() => {
  const _attrs = _.omit(allAttrs.value, ['label'])
  const template = typeof _attrs.template === 'function' ? _attrs.template({ data: props.model }) : _attrs.template

  return {
    ..._attrs,
    template,
    label: props.importLabel,
    title: props.importTitle || props.importLabel,
    dataProps: props.dataProp,
    importMethod
  }
})

// importMethod
function importMethod(data: any) {
  ;(props.model as any)[props.prop] = data[props.dataProp]
}
</script>

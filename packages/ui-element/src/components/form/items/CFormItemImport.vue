<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="c-form-item-import">
    <c-action v-bind="actionAttrs" :disabled="disabled" action-type="import" />
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */

import { _, computed, useAttrs } from '@zto/zpage'

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

const attrs = useAttrs()

const actionAttrs = computed(() => {
  const _attrs = _.omit(attrs, ['label'])
  const template = typeof attrs.template === 'function' ? attrs.template({ data: props.model }) : attrs.template

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

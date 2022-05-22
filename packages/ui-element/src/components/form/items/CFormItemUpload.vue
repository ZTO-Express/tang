<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <c-upload
    v-model="model[prop]"
    v-bind="$attrs"
    :disabled="disabled"
    :on-completed="handleCompleted"
    :on-delete="handleDelete"
    @change="handleChange"
  />
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { useCurrentAppInstance } from '@zto/zpage'

import { useFormItem } from '../util'

import type { GenericFunction } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    prop: string
    nameProp: string
    disabled?: boolean
    onCompleted?: GenericFunction
    onDelete?: GenericFunction
  }>(),
  {
    disabled: false
  }
)

const app = useCurrentAppInstance()

const context = app.useContext(props.model)

const { handleChange } = useFormItem(props)

async function handleCompleted(file: any) {
  if (props.onCompleted) {
    return props.onCompleted(file, context)
  }
}

async function handleDelete(file: any) {
  if (props.onDelete) {
    return props.onDelete(file, context)
  }
}
</script>
